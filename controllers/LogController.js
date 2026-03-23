// 系统日志控制器
const SystemLog = require('../models/SystemLog');
const Admin = require('../models/Admin');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

class LogController {
  // 获取日志列表
  static async getList(req, res) {
    try {
      const { page = 1, limit = 10, keyword, action, admin_id, start_date, end_date } = req.query;
      
      const where = {};
      if (keyword) {
        where.description = { [Op.like]: `%${keyword}%` };
      }
      if (action) {
        where.action = action;
      }
      if (admin_id) {
        where.admin_id = admin_id;
      }
      if (start_date && end_date) {
        where.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }
      
      const offset = (page - 1) * limit;
      const { count, rows } = await SystemLog.findAndCountAll({
        where,
        include: [{ model: Admin, as: 'admin' }],
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']]
      });
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
          list: rows,
          total: count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('获取日志列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取日志列表失败'
      });
    }
  }
  
  // 导出日志
  static async export(req, res) {
    try {
      const { action, admin_id, start_date, end_date } = req.query;
      
      const where = {};
      if (action) {
        where.action = action;
      }
      if (admin_id) {
        where.admin_id = admin_id;
      }
      if (start_date && end_date) {
        where.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }
      
      const logs = await SystemLog.findAll({
        where,
        include: [{ model: Admin, as: 'admin' }],
        order: [['created_at', 'DESC']]
      });
      
      // 生成CSV内容
      let csvContent = '管理员,操作类型,操作描述,IP地址,用户代理,操作时间\n';
      
      logs.forEach(log => {
        const adminName = log.admin ? log.admin.name : '未知';
        const action = log.action || '';
        const description = log.description || '';
        const ip = log.ip || '';
        const userAgent = log.user_agent || '';
        const createdAt = log.created_at ? log.created_at.toISOString() : '';
        
        // 处理CSV特殊字符
        const escapedDescription = description.replace(/"/g, '""');
        const escapedUserAgent = userAgent.replace(/"/g, '""');
        
        csvContent += `"${adminName}","${action}","${escapedDescription}","${ip}","${escapedUserAgent}","${createdAt}"\n`;
      });
      
      // 生成文件名
      const filename = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = path.join(__dirname, '../../uploads', filename);
      
      // 写入文件
      fs.writeFileSync(filePath, csvContent, 'utf8');
      
      // 下载文件
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error('下载日志失败:', err);
          res.status(500).json({
            code: 500,
            message: '下载日志失败'
          });
        }
        
        // 下载完成后删除临时文件
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error('导出日志失败:', error);
      res.status(500).json({
        code: 500,
        message: '导出日志失败'
      });
    }
  }
  
  // 获取操作类型列表
  static async getActionTypes(req, res) {
    try {
      const actions = await SystemLog.findAll({
        attributes: ['action'],
        group: ['action'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('action')), 'DESC']]
      });
      
      const actionTypes = actions.map(item => item.action);
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: actionTypes
      });
    } catch (error) {
      console.error('获取操作类型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取操作类型失败'
      });
    }
  }
}

// 导入Sequelize
const Sequelize = require('sequelize');

module.exports = LogController;