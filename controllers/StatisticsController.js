// 数据统计控制器
const DataStatistics = require('../models/DataStatistics');
const ScenicSpot = require('../models/ScenicSpot');
const TravelGuide = require('../models/TravelGuide');
const UserMessage = require('../models/UserMessage');
const { Op } = require('sequelize');

class StatisticsController {
  // 获取核心统计数据
  static async getCoreStatistics(req, res) {
    try {
      // 景点统计
      const scenicCount = await ScenicSpot.count();
      const scenicOnlineCount = await ScenicSpot.count({ where: { status: 1 } });
      
      // 攻略统计
      const guideCount = await TravelGuide.count();
      const guideApprovedCount = await TravelGuide.count({ where: { status: 1 } });
      
      // 留言统计
      const messageCount = await UserMessage.count();
      const messagePendingCount = await UserMessage.count({ where: { status: 0 } });
      
      // 计算访问量、阅读量等
      const scenicViews = await ScenicSpot.sum('views');
      const guideViews = await TravelGuide.sum('views');
      const guideFavorites = await TravelGuide.sum('favorites');
      const guideLikes = await TravelGuide.sum('likes');
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
          scenic: {
            total: scenicCount,
            online: scenicOnlineCount,
            views: scenicViews || 0
          },
          guide: {
            total: guideCount,
            approved: guideApprovedCount,
            views: guideViews || 0,
            favorites: guideFavorites || 0,
            likes: guideLikes || 0
          },
          message: {
            total: messageCount,
            pending: messagePendingCount
          }
        }
      });
    } catch (error) {
      console.error('获取核心统计数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取核心统计数据失败'
      });
    }
  }
  
  // 获取趋势数据
  static async getTrendData(req, res) {
    try {
      const { days = 7, type } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days + 1);
      
      // 生成日期数组
      const dateArray = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        dateArray.push(date.toISOString().split('T')[0]);
      }
      
      let data = [];
      
      switch (type) {
        case 'scenic_views':
          // 景点访问量趋势
          data = await this.getScenicViewsTrend(dateArray);
          break;
        case 'guide_views':
          // 攻略阅读量趋势
          data = await this.getGuideViewsTrend(dateArray);
          break;
        case 'messages':
          // 留言数量趋势
          data = await this.getMessageTrend(dateArray);
          break;
        case 'guides':
          // 攻略发布趋势
          data = await this.getGuideTrend(dateArray);
          break;
        default:
          return res.status(400).json({
            code: 400,
            message: '无效的统计类型'
          });
      }
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
          dates: dateArray,
          values: data
        }
      });
    } catch (error) {
      console.error('获取趋势数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取趋势数据失败'
      });
    }
  }
  
  // 获取景点访问量趋势
  static async getScenicViewsTrend(dates) {
    const values = [];
    for (const date of dates) {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const result = await DataStatistics.findOne({
        where: {
          type: 'scenic_views',
          date: date
        }
      });
      
      values.push(result ? result.value : 0);
    }
    return values;
  }
  
  // 获取攻略阅读量趋势
  static async getGuideViewsTrend(dates) {
    const values = [];
    for (const date of dates) {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const result = await DataStatistics.findOne({
        where: {
          type: 'guide_views',
          date: date
        }
      });
      
      values.push(result ? result.value : 0);
    }
    return values;
  }
  
  // 获取留言数量趋势
  static async getMessageTrend(dates) {
    const values = [];
    for (const date of dates) {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await UserMessage.count({
        where: {
          created_at: {
            [Op.between]: [new Date(date), nextDate]
          }
        }
      });
      
      values.push(count);
    }
    return values;
  }
  
  // 获取攻略发布趋势
  static async getGuideTrend(dates) {
    const values = [];
    for (const date of dates) {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await TravelGuide.count({
        where: {
          created_at: {
            [Op.between]: [new Date(date), nextDate]
          }
        }
      });
      
      values.push(count);
    }
    return values;
  }
  
  // 获取热门景点
  static async getHotScenicSpots(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const hotScenic = await ScenicSpot.findAll({
        where: { status: 1 },
        order: [['views', 'DESC']],
        limit: parseInt(limit)
      });
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: hotScenic
      });
    } catch (error) {
      console.error('获取热门景点失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取热门景点失败'
      });
    }
  }
  
  // 获取热门攻略
  static async getHotGuides(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const hotGuides = await TravelGuide.findAll({
        where: { status: 1 },
        order: [['views', 'DESC']],
        limit: parseInt(limit),
        include: [{ model: ScenicSpot, as: 'scenic' }]
      });
      
      res.status(200).json({
        code: 200,
        message: '获取成功',
        data: hotGuides
      });
    } catch (error) {
      console.error('获取热门攻略失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取热门攻略失败'
      });
    }
  }
}

module.exports = StatisticsController;