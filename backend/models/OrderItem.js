const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_item_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  inventory_item_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'inventory_items',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'),
    defaultValue: 'pending'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  shipped_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  returned_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['order_item_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = OrderItem; 