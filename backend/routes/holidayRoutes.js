const express = require('express');
const router = express.Router();
const { createHoliday, getHolidays, updateHoliday, deleteHoliday } = require('../controllers/holidayController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(authorize('admin'), createHoliday).get(getHolidays);
router.route('/:id').put(authorize('admin'), updateHoliday).delete(authorize('admin'), deleteHoliday);

module.exports = router;
