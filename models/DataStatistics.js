// 数据统计模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DataStatistics = sequelize.define('DataStatistics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '统计ID'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '统计类型'
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '统计值'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '统计日期'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  }
}, {
  tableName: 'data_statistics',
  timestamps: false,
  indexes: [
    { name: 'idx_type', fields: ['type'] },
    { name: 'idx_date', fields: ['date'] },
    { name: 'uk_type_date', fields: ['type', 'date'], unique: true }
  ]
});

module.exports = DataStatistics;