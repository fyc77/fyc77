// 用户留言控制器
const UserMessage = require('../models/UserMessage');
const SystemLog = require('../models/SystemLog');
const { Op } = require('sequelize');

class MessageController {
  // 获取留言列表
  static async getList(req, res) {
    try {
      const { page = 1, limit = 10, keyword, type, target_id, status, start_date, end_date } = req.query;
      
      const where = {};
      if (keyword) {
        where.content = { [Op.like]: `%${keyword}%` };
      }
      if (type !== undefined) {
        where.type = type;
      }
      if (target_id) {
        where.target_id = target_id;
      }
      if (status !== undefined) {
        where.status = status;
      }
      if (start_date && end_date) {
        where.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }
      
      const offset = (page - 1) * limit;
      const { count, rows } = await UserMessage.findAndCountAll({
        where,
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
      console.error('获取留言列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取留言列表失败'
      });
    }
  }
  
  // 获取留言详情
  static async getDetail(req, res) {
    try {
      const { id } = req.params;
      
      const message = await UserMessage.findByPk(id);
      
      if (!message) {
        return res.status(404).json({
          code: 404,
          message: '留言不存在'
        });
      }
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: message
      });
    } catch (error) {
      console.error('获取留言详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取留言详情失败'
      });
    }
  }
  
  // 回复留言
  static async reply(req, res) {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const admin = req.admin;
      
      const message = await UserMessage.findByPk(id);
      if (!message) {
        return res.status(404).json({
          code: 404,
          message: '留言不存在'
        });
      }
      
      await message.update({ reply, status: 1 });
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '回复留言',
        description: `管理员 ${admin.username} 回复留言 ID: ${id}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '回复成功',
        data: message
      });
    } catch (error) {
      console.error('回复留言失败:', error);
      res.status(500).json({
        code: 500,
        message: '回复留言失败'
      });
    }
  }
  
  // 删除留言
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const admin = req.admin;
      
      const message = await UserMessage.findByPk(id);
      if (!message) {
        return res.status(404).json({
          code: 404,
          message: '留言不存在'
        });
      }
      
      await message.destroy();
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '删除留言',
        description: `管理员 ${admin.username} 删除留言 ID: ${id}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除留言失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除留言失败'
      });
    }
  }
  
  // 隐藏留言
  static async hide(req, res) {
    try {
      const { id } = req.params;
      const admin = req.admin;
      
      const message = await UserMessage.findByPk(id);
      if (!message) {
        return res.status(404).json({
          code: 404,
          message: '留言不存在'
        });
      }
      
      await message.update({ status: 2 });
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '隐藏留言',
        description: `管理员 ${admin.username} 隐藏留言 ID: ${id}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '隐藏成功',
        data: message
      });
    } catch (error) {
      console.error('隐藏留言失败:', error);
      res.status(500).json({
        code: 500,
        message: '隐藏留言失败'
      });
    }
  }
  
  // 批量操作
  static async batchAction(req, res) {
    try {
      const { ids, action, reply } = req.body;
      const admin = req.admin;
      
      let updateData = {};
      let actionName = '';
      
      switch (action) {
        case 'delete':
          await UserMessage.destroy({ where: { id: ids } });
          actionName = '批量删除留言';
          break;
        case 'hide':
          updateData = { status: 2 };
          actionName = '批量隐藏留言';
          break;
        case 'pass':
          updateData = { status: 1 };
          actionName = '批量通过留言';
          break;
        case 'reply':
          if (!reply) {
            return res.status(400).json({
              code: 400,
              message: '请输入回复内容'
            });
          }
          updateData = { reply, status: 1 };
          actionName = '批量回复留言';
          break;
        default:
          return res.status(400).json({
            code: 400,
            message: '无效的操作'
          });
      }
      
      if (Object.keys(updateData).length > 0) {
        await UserMessage.update(updateData, { where: { id: ids } });
      }
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: actionName,
        description: `管理员 ${admin.username} ${actionName}，共 ${ids.length} 条`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '批量操作成功'
      });
    } catch (error) {
      console.error('批量操作失败:', error);
      res.status(500).json({
        code: 500,
        message: '批量操作失败'
      });
    }
  }
}

module.exports = MessageController;