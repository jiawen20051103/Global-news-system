import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './src/config/db.js';
import routes from './src/routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
    // 同步数据库模型
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('数据库同步完成');
    // 启动服务器
    app.listen(port, () => {
      console.log(`服务器运行在 http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });