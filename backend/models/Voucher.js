const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Voucher = sequelize.define('Voucher', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  voucherNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    field: 'voucher_number',
  },
  voucherDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'voucher_date',
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'expense_date',
    validate: {
      notEmpty: { msg: 'Expense date is required' },
    },
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Department is required' },
    },
  },
  expenseTitle: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'expense_title',
    validate: {
      notEmpty: { msg: 'Expense title is required' },
    },
  },
  expenseCategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'expense_category',
  },
  expenseDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'expense_description',
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Amount is required' },
      min: { args: [0.01], msg: 'Amount must be greater than zero' },
    },
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'draft',
  },
  employeeName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'employee_name',
  },
  employeeIdNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'employee_id_number',
  },
  employeeSignature: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'employee_signature',
  },
  directorSignature: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'director_signature',
  },
  approvalDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'approval_date',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'approved_by',
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'vouchers',
  timestamps: true,
});

// Associations
Voucher.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Voucher.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });
User.hasMany(Voucher, { as: 'vouchers', foreignKey: 'createdBy' });

module.exports = Voucher;
