const express = require('express');
const router = express.Router();
const {
  punchIn,
  punchOut,
  getToday,
  getMyHistory,
  getAttendanceAdmin,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/punch-in', authorize('employee'), punchIn);
router.post('/punch-out', authorize('employee'), punchOut);
router.get('/today', authorize('employee'), getToday);
router.get('/my-history', authorize('employee'), getMyHistory);
router.get('/', authorize('admin'), getAttendanceAdmin);

module.exports = router;
