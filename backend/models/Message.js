const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  message_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  conversation_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  sender: {
    type: DataTypes.ENUM('user', 'assistant'),
    allowNull: false
  }
}, {
  tableName: 'messages',
  timestamps: true
});

module.exports = Message;