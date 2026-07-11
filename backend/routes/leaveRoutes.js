const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getMyBalance,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('employee'), applyLeave);
router.get('/my', authorize('employee'), getMyLeaves);
router.get('/my/balance', authorize('employee'), getMyBalance);
router.get('/', authorize('admin'), getAllLeaves);
router.put('/:id/status', authorize('admin'), updateLeaveStatus);

module.exports = router;
