// 主应用文件
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const config = require('./config/config');
const sequelize = require('./config/db');
const routes = require('./routes');

// 创建Express应用
const app = express();

// 中间件配置
// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:8848'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 加载路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({
    code: 200,
    message: '服务运行正常'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});

// 启动服务器
const port = config.server.port;
const host = config.server.host;

app.listen(port, host, () => {
  console.log(`服务器运行在 http://${host}:${port}`);
});

// 同步数据库模型
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('数据库模型同步成功');
  } catch (error) {
    console.error('数据库模型同步失败:', error);
  }
}

syncDatabase();

module.exports = app;