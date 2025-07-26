const sequelize = require('../config/database');
const User = require('./User');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Product = require('./Product');
const Order = require('./Order');

// Define associations
User.hasMany(Conversation, { foreignKey: 'user_id' });
Conversation.belongsTo(User, { foreignKey: 'user_id' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

module.exports = {
  sequelize,
  User,
  Conversation,
  Message,
  Product,
  Order
};