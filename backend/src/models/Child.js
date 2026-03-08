// src/models/Child.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Child = sequelize.define('Child', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rightId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grade: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pagepermisson: {
    type: DataTypes.INTEGER
  },
  routepermisson: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'children',
  timestamps: false
});

export default Child;