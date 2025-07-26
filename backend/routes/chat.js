const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { Conversation, Message } = require('../models');
const LLMService = require('../services/llmService');
const DatabaseService = require('../services/dbService');

const router = express.Router();
const llmService = new LLMService();
const dbService = new DatabaseService();

// Get user conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Message,
        limit: 1,
        order: [['created_at', 'DESC']]
      }],
      order: [['updated_at', 'DESC']]
    });

    res.json({
      conversations: conversations.map(conv => ({
        id: conv.id,
        conversation_id: conv.conversation_id,
        title: conv.title,
        status: conv.status,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        last_message: conv.Messages[0]?.content || 'No messages yet'
      }))
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation messages
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findOne({
      where: { 
        conversation_id: conversationId,
        user_id: req.user.id 
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await Message.findAll({
      where: { conversation_id: conversation.id },
      order: [['created_at', 'ASC']]
    });

    res.json({
      conversation_id: conversation.conversation_id,
      title: conversation.title,
      messages: messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        content: msg.content,
        message_type: msg.message_type,
        created_at: msg.created_at,
        tokens_used: msg.tokens_used,
        processing_time: msg.processing_time
      }))
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message (main chat endpoint)
router.post('/chat', authenticateToken, [
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('conversation_id').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, conversation_id } = req.body;
    const startTime = Date.now();

    // Get or create conversation
    let conversation;
    if (conversation_id) {
      conversation = await Conversation.findOne({
        where: { 
          conversation_id,
          user_id: req.user.id 
        }
      });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        user_id: req.user.id,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      });
    }

    // Save user message
    const userMessage = await Message.create({
      conversation_id: conversation.id,
      sender: 'user',
      content: message,
      message_type: 'text'
    });

    // Get conversation history for context
    const conversationHistory = await Message.findAll({
      where: { conversation_id: conversation.id },
      order: [['created_at', 'ASC']],
      limit: 10 // Last 10 messages for context
    });

    // Prepare messages for LLM
    const llmMessages = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Query database for relevant information
    let dbContext = '';
    try {
      const dbResult = await llmService.queryDatabase(message, dbService);
      dbContext = `Database Context: ${JSON.stringify(dbResult)}`;
    } catch (dbError) {
      console.error('Database query error:', dbError);
      dbContext = 'Database Context: Unable to retrieve specific information';
    }

    // Generate LLM response
    let llmResponse;
    try {
      llmResponse = await llmService.generateResponse(llmMessages, dbContext);
    } catch (llmError) {
      console.error('LLM error:', llmError);
      llmResponse = {
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        tokens_used: 0,
        model: 'fallback'
      };
    }

    const processingTime = Date.now() - startTime;

    // Save assistant message
    const assistantMessage = await Message.create({
      conversation_id: conversation.id,
      sender: 'assistant',
      content: llmResponse.content,
      message_type: 'response',
      tokens_used: llmResponse.tokens_used,
      processing_time: processingTime
    });

    // Update conversation title if it's the first message
    if (conversationHistory.length === 0) {
      await conversation.update({
        title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      });
    }

    res.json({
      conversation_id: conversation.conversation_id,
      response: llmResponse.content,
      message_id: assistantMessage.id,
      tokens_used: llmResponse.tokens_used,
      processing_time: processingTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Delete conversation
router.delete('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findOne({
      where: { 
        conversation_id: conversationId,
        user_id: req.user.id 
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete all messages in the conversation
    await Message.destroy({
      where: { conversation_id: conversation.id }
    });

    // Delete the conversation
    await conversation.destroy();

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router; 