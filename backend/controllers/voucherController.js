const { Op } = require('sequelize');
const { Voucher, User } = require('../models');
const sequelize = require('../config/db');

/**
 * Generate a unique voucher number: VCH-YYYYMMDD-XXXX
 */
const generateVoucherNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `VCH-${dateStr}-`;

  // Find the last voucher created today
  const lastVoucher = await Voucher.findOne({
    where: {
      voucherNumber: { [Op.like]: `${prefix}%` },
    },
    order: [['voucherNumber', 'DESC']],
  });

  let nextNum = 1;
  if (lastVoucher) {
    const lastNum = parseInt(lastVoucher.voucherNumber.split('-').pop(), 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

/**
 * @desc    Create a new voucher (draft)
 * @route   POST /api/vouchers
 * @access  Employee
 */
const createVoucher = async (req, res) => {
  try {
    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
    } = req.body;

    const voucherNumber = await generateVoucherNumber();

    const voucher = await Voucher.create({
      voucherNumber,
      voucherDate: new Date(),
      expenseDate,
      department,
      expenseTitle,
      expenseCategory: expenseCategory || null,
      expenseDescription: expenseDescription || null,
      amount,
      status: 'draft',
      employeeName: req.user.name,
      employeeIdNumber: req.user.employeeId || null,
      createdBy: req.user.id,
    });

    const fullVoucher = await Voucher.findByPk(voucher.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'department'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Voucher created as draft.',
      data: fullVoucher,
    });
  } catch (error) {
    console.error('Create voucher error:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error creating voucher.' });
  }
};

/**
 * @desc    Get all vouchers (role-based filtering)
 * @route   GET /api/vouchers
 * @access  Private
 */
const getVouchers = async (req, res) => {
  try {
    const {
      search,
      status,
      department,
      category,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};

    // Role-based filtering: employees see only their vouchers
    if (req.user.role === 'employee') {
      where.createdBy = req.user.id;
    }

    // Search across multiple fields
    if (search) {
      where[Op.or] = [
        { voucherNumber: { [Op.iLike]: `%${search}%` } },
        { employeeName: { [Op.iLike]: `%${search}%` } },
        { expenseTitle: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Department filter
    if (department) {
      where.department = { [Op.iLike]: `%${department}%` };
    }

    // Category filter
    if (category) {
      where.expenseCategory = { [Op.iLike]: `%${category}%` };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.expenseDate = {};
      if (dateFrom) where.expenseDate[Op.gte] = dateFrom;
      if (dateTo) where.expenseDate[Op.lte] = dateTo;
    }

    // Amount range filter
    if (amountMin || amountMax) {
      where.amount = {};
      if (amountMin) where.amount[Op.gte] = parseFloat(amountMin);
      if (amountMax) where.amount[Op.lte] = parseFloat(amountMax);
    }

    // Validate sort column to prevent SQL injection
    const allowedSortFields = [
      'created_at', 'updated_at', 'voucher_number', 'expense_date',
      'amount', 'status', 'employee_name', 'department',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: vouchers, count: total } = await Voucher.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'department'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
      ],
      order: [[safeSortBy, safeSortOrder]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        vouchers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching vouchers.' });
  }
};

/**
 * @desc    Get single voucher by ID
 * @route   GET /api/vouchers/:id
 * @access  Private (role-based)
 */
const getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'department', 'employee_id_number'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Employees can only view their own vouchers
    if (req.user.role === 'employee' && voucher.createdBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: voucher });
  } catch (error) {
    console.error('Get voucher error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching voucher.' });
  }
};

/**
 * @desc    Update a draft voucher
 * @route   PUT /api/vouchers/:id
 * @access  Employee (own draft only)
 */
const updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.createdBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (voucher.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft vouchers can be edited.',
      });
    }

    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
    } = req.body;

    await voucher.update({
      expenseDate: expenseDate || voucher.expenseDate,
      department: department || voucher.department,
      expenseTitle: expenseTitle || voucher.expenseTitle,
      expenseCategory: expenseCategory !== undefined ? expenseCategory : voucher.expenseCategory,
      expenseDescription: expenseDescription !== undefined ? expenseDescription : voucher.expenseDescription,
      amount: amount || voucher.amount,
    });

    const updatedVoucher = await Voucher.findByPk(voucher.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'department'] },
      ],
    });

    res.json({
      success: true,
      message: 'Voucher updated.',
      data: updatedVoucher,
    });
  } catch (error) {
    console.error('Update voucher error:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error updating voucher.' });
  }
};

/**
 * @desc    Delete a draft voucher
 * @route   DELETE /api/vouchers/:id
 * @access  Employee (own draft only)
 */
const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.createdBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (voucher.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft vouchers can be deleted.',
      });
    }

    await voucher.destroy();

    res.json({ success: true, message: 'Voucher deleted.' });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting voucher.' });
  }
};

/**
 * @desc    Submit a draft voucher for approval
 * @route   PATCH /api/vouchers/:id/submit
 * @access  Employee (own draft only)
 */
const submitVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.createdBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (voucher.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft vouchers can be submitted.',
      });
    }

    // Employee signature is mandatory before submission
    if (!voucher.employeeSignature) {
      return res.status(400).json({
        success: false,
        message: 'Employee signature is required before submitting.',
      });
    }

    await voucher.update({ status: 'submitted' });

    res.json({
      success: true,
      message: 'Voucher submitted for approval.',
      data: voucher,
    });
  } catch (error) {
    console.error('Submit voucher error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting voucher.' });
  }
};

/**
 * @desc    Approve a submitted voucher
 * @route   PATCH /api/vouchers/:id/approve
 * @access  Director
 */
const approveVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted vouchers can be approved.',
      });
    }

    const { directorSignature } = req.body;

    if (!directorSignature) {
      return res.status(400).json({
        success: false,
        message: 'Director signature is required for approval.',
      });
    }

    await voucher.update({
      status: 'approved',
      directorSignature,
      approvalDate: new Date(),
      approvedBy: req.user.id,
    });

    const updatedVoucher = await Voucher.findByPk(voucher.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'department'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.json({
      success: true,
      message: 'Voucher approved.',
      data: updatedVoucher,
    });
  } catch (error) {
    console.error('Approve voucher error:', error);
    res.status(500).json({ success: false, message: 'Server error approving voucher.' });
  }
};

/**
 * @desc    Reject a submitted voucher
 * @route   PATCH /api/vouchers/:id/reject
 * @access  Director
 */
const rejectVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted vouchers can be rejected.',
      });
    }

    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.',
      });
    }

    await voucher.update({
      status: 'rejected',
      rejectionReason,
      approvedBy: req.user.id,
    });

    const updatedVoucher = await Voucher.findByPk(voucher.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'department'] },
        { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.json({
      success: true,
      message: 'Voucher rejected.',
      data: updatedVoucher,
    });
  } catch (error) {
    console.error('Reject voucher error:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting voucher.' });
  }
};

/**
 * @desc    Get dashboard statistics (role-aware)
 * @route   GET /api/vouchers/stats/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const where = {};

    // Employees only see their own stats
    if (req.user.role === 'employee') {
      where.createdBy = req.user.id;
    }

    const totalVouchers = await Voucher.count({ where });
    const draftCount = await Voucher.count({ where: { ...where, status: 'draft' } });
    const submittedCount = await Voucher.count({ where: { ...where, status: 'submitted' } });
    const approvedCount = await Voucher.count({ where: { ...where, status: 'approved' } });
    const rejectedCount = await Voucher.count({ where: { ...where, status: 'rejected' } });

    const totalAmount = await Voucher.sum('amount', { where }) || 0;
    const approvedAmount = await Voucher.sum('amount', {
      where: { ...where, status: 'approved' },
    }) || 0;

    // Today's stats (for director)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const approvedToday = await Voucher.count({
      where: {
        status: 'approved',
        approvalDate: { [Op.gte]: today, [Op.lt]: tomorrow },
      },
    });

    const rejectedToday = await Voucher.count({
      where: {
        status: 'rejected',
        updatedAt: { [Op.gte]: today, [Op.lt]: tomorrow },
      },
    });

    const pendingAmount = await Voucher.sum('amount', {
      where: { status: 'submitted' },
    }) || 0;

    // Recent vouchers
    const recentWhere = { ...where };
    const recentVouchers = await Voucher.findAll({
      where: recentWhere,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['updatedAt', 'DESC']],
      limit: 5,
    });

    res.json({
      success: true,
      data: {
        totalVouchers,
        draftCount,
        submittedCount,
        approvedCount,
        rejectedCount,
        totalAmount: parseFloat(totalAmount),
        approvedAmount: parseFloat(approvedAmount),
        approvedToday,
        rejectedToday,
        pendingAmount: parseFloat(pendingAmount),
        recentVouchers,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
};

/**
 * @desc    Upload signature to a voucher
 * @route   PATCH /api/vouchers/:id/signature
 * @access  Employee (own) / Director
 */
const uploadSignature = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    const { signatureUrl, type } = req.body;

    if (!signatureUrl) {
      return res.status(400).json({ success: false, message: 'Signature URL is required.' });
    }

    if (type === 'employee') {
      // Only the creator can upload employee signature
      if (voucher.createdBy !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (voucher.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Employee signature can only be uploaded for draft vouchers.',
        });
      }
      await voucher.update({ employeeSignature: signatureUrl });
    } else if (type === 'director') {
      if (req.user.role !== 'director') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      await voucher.update({ directorSignature: signatureUrl });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid signature type.' });
    }

    res.json({
      success: true,
      message: 'Signature uploaded successfully.',
      data: voucher,
    });
  } catch (error) {
    console.error('Upload signature error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading signature.' });
  }
};

module.exports = {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
  getDashboardStats,
  uploadSignature,
};
