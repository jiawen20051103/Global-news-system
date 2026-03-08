import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING
  },
  avatar: {
    type: DataTypes.STRING
  },
  followCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fansCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  visitCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  roleState: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  region: {
    type: DataTypes.STRING
  },
  roleId: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'users',
  timestamps: false
});

export default User;