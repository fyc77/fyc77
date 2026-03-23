// 旅游攻略模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const ScenicSpot = require('./ScenicSpot');

const TravelGuide = sequelize.define('TravelGuide', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '攻略ID'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题'
  },
  author: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '作者'
  },
  scenic_id: {
    type: DataTypes.INTEGER,
    comment: '关联景点ID'
  },
  itinerary: {
    type: DataTypes.TEXT,
    comment: '行程安排'
  },
  content: {
    type: DataTypes.TEXT,
    comment: '图文内容'
  },
  tags: {
    type: DataTypes.STRING(255),
    comment: '标签'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态：0-待审核，1-已通过，2-已驳回'
  },
  reject_reason: {
    type: DataTypes.STRING(255),
    comment: '驳回原因'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '阅读量'
  },
  favorites: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '收藏数'
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '点赞数'
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
  tableName: 'travel_guide',
  timestamps: false,
  indexes: [
    { name: 'idx_status', fields: ['status'] },
    { name: 'idx_scenic', fields: ['scenic_id'] },
    { name: 'idx_title', fields: ['title'] }
  ]
});

// 关联关系
TravelGuide.belongsTo(ScenicSpot, { foreignKey: 'scenic_id', as: 'scenic' });

module.exports = TravelGuide;