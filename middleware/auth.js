// 认证中间件
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Admin = require('../models/Admin');

// 验证JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 查找管理员
    const admin = await Admin.findByPk(decoded.id, {
      include: [{ model: require('../models/Role'), as: 'role' }]
    });
    
    if (!admin || admin.status !== 1) {
      return res.status(401).json({
        code: 401,
        message: '管理员不存在或已被禁用'
      });
    }
    
    // 将管理员信息存储到请求对象中
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '无效的token'
    });
  }
};

// 验证权限
const checkPermission = (permission) => {
  return (req, res, next) => {
    try {
      const admin = req.admin;
      const rolePermissions = admin.role?.permissions || {};
      
      if (!rolePermissions[permission]) {
        return res.status(403).json({
          code: 403,
          message: '无权限执行此操作'
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        code: 500,
        message: '权限验证失败'
      });
    }
  };
};

module.exports = {
  verifyToken,
  checkPermission
};