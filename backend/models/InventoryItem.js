const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inventory_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'sold', 'reserved', 'damaged'),
    defaultValue: 'available'
  },
  sold_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  order_item_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'inventory_items',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['inventory_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = InventoryItem; 