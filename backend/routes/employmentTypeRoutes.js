const express = require('express');
const router = express.Router();
const {
  createEmploymentType,
  getEmploymentTypes,
  getEmploymentTypeById,
  updateEmploymentType,
  updateLeavePolicy,
  deleteEmploymentType,
} = require('../controllers/employmentTypeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(authorize('admin'), createEmploymentType).get(getEmploymentTypes);

router
  .route('/:id')
  .get(getEmploymentTypeById)
  .put(authorize('admin'), updateEmploymentType)
  .delete(authorize('admin'), deleteEmploymentType);

router.put('/:id/leave-policy', authorize('admin'), updateLeavePolicy);

module.exports = router;
