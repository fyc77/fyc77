// 路由配置
const express = require('express');
const router = express.Router();

// 导入控制器
const AuthController = require('../controllers/AuthController');
const ScenicController = require('../controllers/ScenicController');
const GuideController = require('../controllers/GuideController');
const MessageController = require('../controllers/MessageController');
const StatisticsController = require('../controllers/StatisticsController');
const LogController = require('../controllers/LogController');

// 导入中间件
const { verifyToken, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 认证路由
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', verifyToken, AuthController.logout);
router.get('/auth/me', verifyToken, AuthController.getCurrentAdmin);
router.post('/auth/reset-password', verifyToken, AuthController.resetPassword);

// 景点路由
router.get('/scenic/list', verifyToken, checkPermission('scenic'), ScenicController.getList);
router.get('/scenic/detail/:id', verifyToken, checkPermission('scenic'), ScenicController.getDetail);
router.post('/scenic/create', verifyToken, checkPermission('scenic'), ScenicController.create);
router.put('/scenic/update/:id', verifyToken, checkPermission('scenic'), ScenicController.update);
router.delete('/scenic/delete/:id', verifyToken, checkPermission('scenic'), ScenicController.delete);
router.put('/scenic/status/:id', verifyToken, checkPermission('scenic'), ScenicController.updateStatus);
router.get('/scenic/categories', verifyToken, checkPermission('scenic'), ScenicController.getCategories);

// 攻略路由
router.get('/guide/list', verifyToken, checkPermission('guide'), GuideController.getList);
router.get('/guide/detail/:id', verifyToken, checkPermission('guide'), GuideController.getDetail);
router.post('/guide/create', verifyToken, checkPermission('guide'), GuideController.create);
router.put('/guide/update/:id', verifyToken, checkPermission('guide'), GuideController.update);
router.delete('/guide/delete/:id', verifyToken, checkPermission('guide'), GuideController.delete);
router.put('/guide/review/:id', verifyToken, checkPermission('guide'), GuideController.review);
router.post('/guide/batch-review', verifyToken, checkPermission('guide'), GuideController.batchReview);

// 留言路由
router.get('/message/list', verifyToken, checkPermission('message'), MessageController.getList);
router.get('/message/detail/:id', verifyToken, checkPermission('message'), MessageController.getDetail);
router.put('/message/reply/:id', verifyToken, checkPermission('message'), MessageController.reply);
router.delete('/message/delete/:id', verifyToken, checkPermission('message'), MessageController.delete);
router.put('/message/hide/:id', verifyToken, checkPermission('message'), MessageController.hide);
router.post('/message/batch-action', verifyToken, checkPermission('message'), MessageController.batchAction);

// 统计路由
router.get('/statistics/core', verifyToken, checkPermission('statistics'), StatisticsController.getCoreStatistics);
router.get('/statistics/trend', verifyToken, checkPermission('statistics'), StatisticsController.getTrendData);
router.get('/statistics/hot-scenic', verifyToken, checkPermission('statistics'), StatisticsController.getHotScenicSpots);
router.get('/statistics/hot-guide', verifyToken, checkPermission('statistics'), StatisticsController.getHotGuides);

// 日志路由
router.get('/log/list', verifyToken, checkPermission('log'), LogController.getList);
router.get('/log/export', verifyToken, checkPermission('log'), LogController.export);
router.get('/log/actions', verifyToken, checkPermission('log'), LogController.getActionTypes);

// 上传路由
router.post('/upload/image', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: '请选择文件'
    });
  }
  
  res.status(200).json({
    code: 200,
    message: '上传成功',
    data: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    }
  });
});

module.exports = router;