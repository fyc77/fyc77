// 管理员模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Role = require('./Role');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '管理员ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码（加密存储）'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '管理员姓名'
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '角色ID'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  },
  last_login: {
    type: DataTypes.DATE,
    comment: '最后登录时间'
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
  tableName: 'admin',
  timestamps: false,
  indexes: [
    { name: 'idx_username', fields: ['username'] },
    { name: 'idx_role_id', fields: ['role_id'] },
    { name: 'idx_status', fields: ['status'] }
  ]
});

// 关联关系
Admin.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

module.exports = Admin;