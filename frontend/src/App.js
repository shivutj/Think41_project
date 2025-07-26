import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage = { sender: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send to backend
      const response = await axios.post('http://localhost:3001/api/chat', {
        message: inputMessage,
        user_id: userId
      });

      // Add bot response to chat
      const botMessage = { sender: 'bot', content: response.data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { sender: 'bot', content: 'Sorry, something went wrong!' };
      setMessages(prev => [...prev, errorMessage]);
    }

    setInputMessage('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Think41 Chat</h1>
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
