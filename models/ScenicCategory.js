// 景点分类模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ScenicCategory = sequelize.define('ScenicCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '分类ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '分类名称'
  },
  parent_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '父分类ID'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
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
  tableName: 'scenic_category',
  timestamps: false,
  indexes: [
    { name: 'idx_parent_id', fields: ['parent_id'] },
    { name: 'idx_sort', fields: ['sort'] }
  ]
});

module.exports = ScenicCategory;