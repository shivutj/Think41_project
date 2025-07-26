const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User, Conversation, Message, Product, Order } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync();
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Database error:', error);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running!', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, user_id } = req.body;
    
    if (!message || !user_id) {
      return res.status(400).json({ error: 'Message and user_id required' });
    }

    // Simple response for now
    const response = `Echo: ${message}`;
    
    res.json({
      response,
      conversation_id: uuidv4(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
