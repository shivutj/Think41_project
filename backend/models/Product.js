const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  retail_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  distribution_center_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['product_id']
    },
    {
      unique: true,
      fields: ['sku']
    },
    {
      fields: ['category']
    },
    {
      fields: ['brand']
    },
    {
      fields: ['department']
    }
  ]
});

module.exports = Product;
