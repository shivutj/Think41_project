const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'),
    defaultValue: 'pending'
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  num_of_item: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
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
  tableName: 'orders',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['order_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Order;
