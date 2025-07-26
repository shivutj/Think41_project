const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DistributionCenter = sequelize.define('DistributionCenter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  center_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'distribution_centers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['center_id']
    },
    {
      fields: ['name']
    }
  ]
});

module.exports = DistributionCenter; 