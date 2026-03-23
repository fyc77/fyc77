// 景点控制器
const ScenicSpot = require('../models/ScenicSpot');
const ScenicCategory = require('../models/ScenicCategory');
const SystemLog = require('../models/SystemLog');

class ScenicController {
  // 获取景点列表
  static async getList(req, res) {
    try {
      const { page = 1, limit = 10, keyword, category_id, status } = req.query;
      
      const where = {};
      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }
      if (category_id) {
        where.category_id = category_id;
      }
      if (status !== undefined) {
        where.status = status;
      }
      
      const offset = (page - 1) * limit;
      const { count, rows } = await ScenicSpot.findAndCountAll({
        where,
        include: [{ model: ScenicCategory, as: 'category' }],
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
      console.error('获取景点列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取景点列表失败'
      });
    }
  }
  
  // 获取景点详情
  static async getDetail(req, res) {
    try {
      const { id } = req.params;
      
      const scenic = await ScenicSpot.findByPk(id, {
        include: [{ model: ScenicCategory, as: 'category' }]
      });
      
      if (!scenic) {
        return res.status(404).json({
          code: 404,
          message: '景点不存在'
        });
      }
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: scenic
      });
    } catch (error) {
      console.error('获取景点详情失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取景点详情失败'
      });
    }
  }
  
  // 新增景点
  static async create(req, res) {
    try {
      const { name, address, level, category_id, ticket_price, opening_hours, description, traffic, contact } = req.body;
      const admin = req.admin;
      
      const scenic = await ScenicSpot.create({
        name,
        address,
        level,
        category_id,
        ticket_price,
        opening_hours,
        description,
        traffic,
        contact
      });
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '新增景点',
        description: `管理员 ${admin.username} 新增景点 ${name}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(201).json({
        code: 201,
        message: '创建成功',
        data: scenic
      });
    } catch (error) {
      console.error('创建景点失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建景点失败'
      });
    }
  }
  
  // 编辑景点
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, address, level, category_id, ticket_price, opening_hours, description, traffic, contact } = req.body;
      const admin = req.admin;
      
      const scenic = await ScenicSpot.findByPk(id);
      if (!scenic) {
        return res.status(404).json({
          code: 404,
          message: '景点不存在'
        });
      }
      
      await scenic.update({
        name,
        address,
        level,
        category_id,
        ticket_price,
        opening_hours,
        description,
        traffic,
        contact
      });
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '编辑景点',
        description: `管理员 ${admin.username} 编辑景点 ${name}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '更新成功',
        data: scenic
      });
    } catch (error) {
      console.error('更新景点失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新景点失败'
      });
    }
  }
  
  // 删除景点
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const admin = req.admin;
      
      const scenic = await ScenicSpot.findByPk(id);
      if (!scenic) {
        return res.status(404).json({
          code: 404,
          message: '景点不存在'
        });
      }
      
      const name = scenic.name;
      await scenic.destroy();
      
      // 记录日志
      await SystemLog.create({
        admin_id: admin.id,
        action: '删除景点',
        description: `管理员 ${admin.username} 删除景点 ${name}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除景点失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除景点失败'
      });
    }
  }
  
  // 上下架景点
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const admin = req.admin;
      
      const scenic = await ScenicSpot.findByPk(id);
      if (!scenic) {
        return res.status(404).json({
          code: 404,
          message: '景点不存在'
        });
      }
      
      await scenic.update({ status });
      
      // 记录日志
      const action = status === 1 ? '上架景点' : '下架景点';
      await SystemLog.create({
        admin_id: admin.id,
        action,
        description: `管理员 ${admin.username} ${action} ${scenic.name}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });
      
      res.status(200).json({
        code: 200,
        message: '状态更新成功',
        data: scenic
      });
    } catch (error) {
      console.error('更新景点状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新景点状态失败'
      });
    }
  }
  
  // 获取景点分类列表
  static async getCategories(req, res) {
    try {
      const categories = await ScenicCategory.findAll({
        order: [['sort', 'ASC']]
      });
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: categories
      });
    } catch (error) {
      console.error('获取景点分类失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取景点分类失败'
      });
    }
  }
}

// 导入Op操作符
const { Op } = require('sequelize');

module.exports = ScenicController;