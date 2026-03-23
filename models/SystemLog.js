// 系统日志模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Admin = require('./Admin');

const SystemLog = sequelize.define('SystemLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '日志ID'
  },
  admin_id: {
    type: DataTypes.INTEGER,
    comment: '管理员ID'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '操作类型'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '操作描述'
  },
  ip: {
    type: DataTypes.STRING(50),
    comment: '操作IP'
  },
  user_agent: {
    type: DataTypes.STRING(255),
    comment: '用户代理'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  }
}, {
  tableName: 'system_log',
  timestamps: false,
  indexes: [
    { name: 'idx_admin', fields: ['admin_id'] },
    { name: 'idx_action', fields: ['action'] },
    { name: 'idx_created_at', fields: ['created_at'] }
  ]
});

// 关联关系
SystemLog.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

module.exports = SystemLog;