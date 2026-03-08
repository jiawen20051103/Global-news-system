import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const News = sequelize.define('News', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  summary: {
    type: DataTypes.STRING
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  region: {
    type: DataTypes.STRING
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roleId: {
    type: DataTypes.STRING
  },
  auditState: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  publishState: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createTime: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  publishTime: {
    type: DataTypes.BIGINT
  },
  star: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  view: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  readCount: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'news',
  timestamps: false
});

export default News;