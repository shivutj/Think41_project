const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  sender: {
    type: DataTypes.ENUM('user', 'assistant'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  message_type: {
    type: DataTypes.ENUM('text', 'query', 'response'),
    defaultValue: 'text'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  tokens_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  processing_time: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    {
      fields: ['conversation_id']
    },
    {
      fields: ['sender']
    }
  ]
});

module.exports = Message;