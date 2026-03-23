// 认证控制器
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Admin = require('../models/Admin');
const SystemLog = require('../models/SystemLog');

class AuthController {
  // 登录
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // 查找管理员
      const admin = await Admin.findOne({ where: { username } });
      
      if (!admin) {
        return res.status(401).json({
          code: 401,
          message: '用户名或密码错误'
        });
      }
      
      // 检查状态
      if (admin.status !== 1) {
        return res.status(401).json({
          code: 401,
          message: '账户已被禁用'
        });
      }
      
      // 验证密码
      const isMatch = (password === admin.password);
      if (!isMatch) {
        return res.status(401).json({
          code: 401,
          message: '用户名或密码错误'
        });
      }
      
      // 更新最后登录时间
      await admin.update({ last_login: new Date() });
      
      // 生成token
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // 记录登录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '登录',
        description: `管理员 ${admin.username} 登录系统`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role_id: admin.role_id
          }
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({
        code: 500,
        message: '登录失败'
      });
    }
  }
  
  // 登出
  static async logout(req, res) {
    try {
      const admin = req.admin;
      
      // 记录登出日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '登出',
        description: `管理员 ${admin.username} 登出系统`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '登出成功'
      });
    } catch (error) {
      console.error('登出失败:', error);
      res.status(500).json({
        code: 500,
        message: '登出失败'
      });
    }
  }
  
  // 获取当前管理员信息
  static async getCurrentAdmin(req, res) {
    try {
      const admin = req.admin;
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role_id: admin.role_id,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('获取管理员信息失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取管理员信息失败'
      });
    }
  }
  
  // 重置密码
  static async resetPassword(req, res) {
    try {
      const admin = req.admin;
      const { oldPassword, newPassword } = req.body;
      
      // 验证旧密码
      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({
          code: 400,
          message: '旧密码错误'
        });
      }
      
      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // 更新密码
      await admin.update({ password: hashedPassword });
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '重置密码',
        description: `管理员 ${admin.username} 重置密码`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '密码重置成功'
      });
    } catch (error) {
      console.error('重置密码失败:', error);
      res.status(500).json({
        code: 500,
        message: '重置密码失败'
      });
    }
  }
}

module.exports = AuthController;