// 景点模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ScenicCategory = require('./ScenicCategory');

const ScenicSpot = sequelize.define('ScenicSpot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '景点ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '景点名称'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '地址'
  },
  level: {
    type: DataTypes.STRING(20),
    comment: '景点等级'
  },
  category_id: {
    type: DataTypes.INTEGER,
    comment: '分类ID'
  },
  ticket_price: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '门票价格'
  },
  opening_hours: {
    type: DataTypes.STRING(255),
    comment: '开放时间'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '图文详情'
  },
  traffic: {
    type: DataTypes.TEXT,
    comment: '交通信息'
  },
  contact: {
    type: DataTypes.STRING(255),
    comment: '联系方式'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-上架，0-下架'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '访问量'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'scenic_spot',
  timestamps: false,
  indexes: [
    { name: 'idx_status', fields: ['status'] },
    { name: 'idx_category', fields: ['category_id'] },
    { name: 'idx_name', fields: ['name'] }
  ]
});

// 关联关系
ScenicSpot.belongsTo(ScenicCategory, { foreignKey: 'category_id', as: 'category' });

module.exports = ScenicSpot;