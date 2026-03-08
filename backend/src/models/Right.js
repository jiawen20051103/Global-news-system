import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Right = sequelize.define('Right', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pagepermisson: {
    type: DataTypes.INTEGER
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'rights',
  timestamps: false
});

export default Right;