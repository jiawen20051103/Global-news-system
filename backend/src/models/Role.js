import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  roleName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roleType: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rights: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'roles',
  timestamps: false
});

export default Role;