// 旅游攻略控制器
const TravelGuide = require('../models/TravelGuide');
const ScenicSpot = require('../models/ScenicSpot');
const SystemLog = require('../models/SystemLog');
const { Op } = require('sequelize');

class GuideController {
  // 获取攻略列表
  static async getList(req, res) {
    try {
      const { page = 1, limit = 10, keyword, scenic_id, status, start_date, end_date } = req.query;
      
      const where = {};
      if (keyword) {
        where.title = { [Op.like]: `%${keyword}%` };
      }
      if (scenic_id) {
        where.scenic_id = scenic_id;
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
      const { count, rows } = await TravelGuide.findAndCountAll({
        where,
        include: [{ model: ScenicSpot, as: 'scenic' }],
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
      console.error('获取攻略列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取攻略列表失败'
      });
    }
  }
  
  // 获取攻略详情
  static async getDetail(req, res) {
    try {
      const { id } = req.params;
      
      const guide = await TravelGuide.findByPk(id, {
        include: [{ model: ScenicSpot, as: 'scenic' }]
      });
      
      if (!guide) {
        return res.status(404).json({
          code: 404,
          message: '攻略不存在'
        });
      }
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: guide
      });
    } catch (error) {
      console.error('获取攻略详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取攻略详情失败'
      });
    }
  }
  
  // 新增攻略
  static async create(req, res) {
    try {
      const { title, author, scenic_id, itinerary, content, tags } = req.body;
      const admin = req.admin;
      
      const guide = await TravelGuide.create({
        title,
        author,
        scenic_id,
        itinerary,
        content,
        tags
      });
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '新增攻略',
        description: `管理员 ${admin.username} 新增攻略 ${title}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(201).json({
        code: 201,
        message: '创建成功',
        data: guide
      });
    } catch (error) {
      console.error('创建攻略失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建攻略失败'
      });
    }
  }
  
  // 编辑攻略
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, author, scenic_id, itinerary, content, tags } = req.body;
      const admin = req.admin;
      
      const guide = await TravelGuide.findByPk(id);
      if (!guide) {
        return res.status(404).json({
          code: 404,
          message: '攻略不存在'
        });
      }
      
      await guide.update({
        title,
        author,
        scenic_id,
        itinerary,
        content,
        tags,
        status: 0 // 编辑后重置为待审核状态
      });
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '编辑攻略',
        description: `管理员 ${admin.username} 编辑攻略 ${title}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '更新成功',
        data: guide
      });
    } catch (error) {
      console.error('更新攻略失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新攻略失败'
      });
    }
  }
  
  // 删除攻略
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const admin = req.admin;
      
      const guide = await TravelGuide.findByPk(id);
      if (!guide) {
        return res.status(404).json({
          code: 404,
          message: '攻略不存在'
        });
      }
      
      const title = guide.title;
      await guide.destroy();
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '删除攻略',
        description: `管理员 ${admin.username} 删除攻略 ${title}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除攻略失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除攻略失败'
      });
    }
  }
  
  // 审核攻略
  static async review(req, res) {
    try {
      const { id } = req.params;
      const { status, reject_reason } = req.body;
      const admin = req.admin;
      
      const guide = await TravelGuide.findByPk(id);
      if (!guide) {
        return res.status(404).json({
          code: 404,
          message: '攻略不存在'
        });
      }
      
      await guide.update({
        status,
        reject_reason: status === 2 ? reject_reason : null
      });
      
      // 记录日志
      const action = status === 1 ? '通过攻略' : '驳回攻略';
      await SystemLog.create({
        admin_id: admin.id,
        action,
        description: `管理员 ${admin.username} ${action} ${guide.title}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '审核成功',
        data: guide
      });
    } catch (error) {
      console.error('审核攻略失败:', error);
      res.status(500).json({
        code: 500,
        message: '审核攻略失败'
      });
    }
  }
  
  // 批量审核
  static async batchReview(req, res) {
    try {
      const { ids, status, reject_reason } = req.body;
      const admin = req.admin;
      
      await TravelGuide.update(
        {
          status,
          reject_reason: status === 2 ? reject_reason : null
        },
        {
          where: { id: ids }
        }
      );
      
      // 记录日志
      const action = status === 1 ? '批量通过攻略' : '批量驳回攻略';
      await SystemLog.create({
        admin_id: admin.id,
        action,
        description: `管理员 ${admin.username} ${action}，共 ${ids.length} 条`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '批量审核成功'
      });
    } catch (error) {
      console.error('批量审核失败:', error);
      res.status(500).json({
        code: 500,
        message: '批量审核失败'
      });
    }
  }
}

module.exports = GuideController;