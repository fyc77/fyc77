// 用户留言模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserMessage = sequelize.define('UserMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '留言ID'
  },
  user_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用户姓名'
  },
  email: {
    type: DataTypes.STRING(100),
    comment: '邮箱'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '留言内容'
  },
  type: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '留言类型：0-景点留言，1-攻略留言'
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关联ID（景点ID或攻略ID）'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态：0-待审核，1-已通过，2-已隐藏'
  },
  reply: {
    type: DataTypes.TEXT,
    comment: '回复内容'
  },
  is_reported: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否被举报：0-否，1-是'
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
  tableName: 'user_message',
  timestamps: false,
  indexes: [
    { name: 'idx_status', fields: ['status'] },
    { name: 'idx_type_target', fields: ['type', 'target_id'] },
    { name: 'idx_created_at', fields: ['created_at'] }
  ]
});

module.exports = UserMessage;