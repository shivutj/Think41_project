const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => 'conv_' + Math.random().toString(36).substr(2, 9)
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'New Conversation'
  },
  status: {
    type: DataTypes.ENUM('active', 'archived', 'closed'),
    defaultValue: 'active'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      unique: true,
      fields: ['conversation_id']
    }
  ]
});

module.exports = Conversation;