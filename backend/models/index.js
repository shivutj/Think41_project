const sequelize = require('../config/database');
const User = require('./User');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const InventoryItem = require('./InventoryItem');
const DistributionCenter = require('./DistributionCenter');

// User associations
User.hasMany(Conversation, { foreignKey: 'user_id' });
Conversation.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// Conversation associations
Conversation.hasMany(Message, { foreignKey: 'conversation_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

// Product associations
Product.hasMany(InventoryItem, { foreignKey: 'product_id' });
InventoryItem.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// Order associations
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// Distribution Center associations
DistributionCenter.hasMany(Product, { foreignKey: 'distribution_center_id' });
Product.belongsTo(DistributionCenter, { foreignKey: 'distribution_center_id' });

// Inventory associations
InventoryItem.hasOne(OrderItem, { foreignKey: 'inventory_item_id' });
OrderItem.belongsTo(InventoryItem, { foreignKey: 'inventory_item_id' });

module.exports = {
  sequelize,
  User,
  Conversation,
  Message,
  Product,
  Order,
  OrderItem,
  InventoryItem,
  DistributionCenter
};