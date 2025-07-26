import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Auth from './components/Auth';
import './App.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.timeout = 10000;

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        loadConversations();
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        handleLogout();
      }
    }
  }, []);

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/chat/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await axios.get(`/api/chat/conversations/${conversationId}/messages`);
      setCurrentConversation({ id: conversationId });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setError('Failed to load conversation');
    }
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setError('');
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    loadConversations();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setConversations([]);
    setCurrentConversation(null);
    setMessages([]);
    setError('');
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = { sender: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError('');

    try {
      let conversationId = currentConversation?.id;
      
      // Create new conversation if none exists
      if (!conversationId) {
        const newConvResponse = await axios.post('/api/chat/conversations', {
          title: inputMessage.substring(0, 50) + (inputMessage.length > 50 ? '...' : '')
        });
        conversationId = newConvResponse.data.conversation.id;
        setCurrentConversation(newConvResponse.data.conversation);
        loadConversations(); // Refresh conversation list
      }

      // Send message to conversation
      const response = await axios.post(`/api/chat/conversations/${conversationId}/messages`, {
        message: inputMessage
      });

      const botMessage = { 
        sender: 'assistant', 
        content: response.data.response,
        timestamp: new Date(response.data.timestamp)
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'Sorry, something went wrong!';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        handleLogout();
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      }
      
      setError(errorMessage);
      const botMessage = { sender: 'assistant', content: errorMessage, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`/api/chat/conversations/${conversationId}`);
      if (currentConversation?.conversation_id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
        <h1>Think41 E-commerce Chatbot</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="chat-layout">
          {/* Conversations Sidebar */}
          <div className="conversations-sidebar">
            <div className="sidebar-header">
              <h3>Conversations</h3>
              <button onClick={startNewConversation} className="new-chat-btn">
                New Chat
              </button>
            </div>
            <div className="conversations-list">
              {conversations.map((conv) => (
                <div 
                  key={conv.conversation_id} 
                  className={`conversation-item ${currentConversation?.conversation_id === conv.conversation_id ? 'active' : ''}`}
                  onClick={() => loadConversation(conv.conversation_id)}
                >
                  <div className="conversation-title">{conv.title}</div>
                  <div className="conversation-preview">{conv.last_message}</div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.conversation_id);
                    }}
                    className="delete-conv-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-container">
            <div className="messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <h3>Welcome to Think41 E-commerce Chatbot!</h3>
                  <p>I can help you with:</p>
                  <ul>
                    <li>Product inquiries and availability</li>
                    <li>Order status and tracking</li>
                    <li>Top selling products</li>
                    <li>General customer support</li>
                  </ul>
                  <p>Try asking: "What are the top 5 most sold products?" or "Show me the status of order ID 12345"</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <div className="message-header">
                    <strong>{msg.sender === 'user' ? 'You' : 'Assistant'}</strong>
                    <span className="timestamp">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about products, orders, or anything else..."
                disabled={loading}
                maxLength={2000}
              />
              <button 
                onClick={sendMessage} 
                disabled={loading || !inputMessage.trim()}
                className="send-btn"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
