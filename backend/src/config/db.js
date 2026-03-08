import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 使用 CockroachDB / Postgres 连接串
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Cockroach Cloud 一般需要关闭证书校验
    },
  },
});

export default sequelize;