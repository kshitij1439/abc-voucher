const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' },
    },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Must be a valid email address' },
      notEmpty: { msg: 'Email is required' },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
    },
  },
  role: {
    type: DataTypes.ENUM('employee', 'director', 'accounts'),
    allowNull: false,
    defaultValue: 'employee',
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  employeeId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'employee_id_number',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
