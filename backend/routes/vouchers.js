const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/voucherController');

// Dashboard stats - must be before /:id route
router.get('/stats/dashboard', authenticate, getDashboardStats);

// CRUD routes
router.get('/', authenticate, getVouchers);
router.get('/:id', authenticate, getVoucherById);
router.post('/', authenticate, authorize('employee'), createVoucher);
router.put('/:id', authenticate, authorize('employee'), updateVoucher);
router.delete('/:id', authenticate, authorize('employee'), deleteVoucher);

// Workflow routes
router.patch('/:id/submit', authenticate, authorize('employee'), submitVoucher);
router.patch('/:id/approve', authenticate, authorize('director'), approveVoucher);
router.patch('/:id/reject', authenticate, authorize('director'), rejectVoucher);

// Signature upload
router.patch('/:id/signature', authenticate, uploadSignature);

module.exports = router;
