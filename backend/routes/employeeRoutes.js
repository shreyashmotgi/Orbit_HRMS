const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getManagerOptions,
  resetPassword,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/managers/list', authorize('admin'), getManagerOptions);

router.route('/').post(authorize('admin'), createEmployee).get(authorize('admin'), getEmployees);

router.put('/:id/reset-password', authorize('admin'), resetPassword);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('admin'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;
