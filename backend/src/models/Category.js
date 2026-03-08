import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'categories',
  timestamps: false
});

export default Category;