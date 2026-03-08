import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Region = sequelize.define('Region', {
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
  tableName: 'regions',
  timestamps: false
});

export default Region;