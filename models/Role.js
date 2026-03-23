// 角色模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '角色ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '角色名称'
  },
  description: {
    type: DataTypes.STRING(255),
    comment: '角色描述'
  },
  permissions: {
    type: DataTypes.JSON,
    comment: '权限列表'
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
  tableName: 'role',
  timestamps: false
});

module.exports = Role;