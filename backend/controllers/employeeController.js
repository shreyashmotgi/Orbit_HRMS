const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { getNextSequence } = require('../models/Counter');

// @desc    Create a new employee (creates linked User login account too)
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    phoneNumber,
    dateOfJoining,
    designation,
    monthlySalary,
    employmentType,
    reportingManager,
    status,
  } = req.body;

  if (!fullName || !email || !password || !phoneNumber || !dateOfJoining || !designation || !monthlySalary || !employmentType) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  // Create the login account
  const user = await User.create({
    name: fullName,
    email,
    password,
    role: 'employee',
  });

  const seq = await getNextSequence('employeeId');
  const employeeId = `EMP${String(seq).padStart(3, '0')}`;

  try {
    const employee = await Employee.create({
      employeeId,
      user: user._id,
      fullName,
      email,
      phoneNumber,
      dateOfJoining,
      designation,
      monthlySalary,
      employmentType,
      reportingManager: reportingManager || null,
      status: status || 'Active',
    });

    const populated = await employee.populate([
      { path: 'employmentType', select: 'name' },
      { path: 'reportingManager', select: 'fullName employeeId' },
    ]);

    res.status(201).json({ success: true, employee: populated });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }
});

// @desc    List all employees, with search + filter
// @route   GET /api/employees?search=&status=&employmentType=
// @access  Private/Admin
const getEmployees = asyncHandler(async (req, res) => {
  const { search, status, employmentType } = req.query;

  const query = {};
  if (status) query.status = status;
  if (employmentType) query.employmentType = employmentType;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } },
    ];
  }

  const employees = await Employee.find(query)
    .populate('employmentType', 'name')
    .populate('reportingManager', 'fullName employeeId')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: employees.length, employees });
});

// @desc    Get a single employee's full profile
// @route   GET /api/employees/:id
// @access  Private/Admin, or the employee themself
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('employmentType')
    .populate('reportingManager', 'fullName employeeId designation');

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // An employee may only view their own profile admin may view any
  if (req.user.role === 'employee' && String(employee.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view this profile');
  }

  res.json({ success: true, employee });
});

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  const fields = [
    'fullName',
    'phoneNumber',
    'dateOfJoining',
    'designation',
    'monthlySalary',
    'employmentType',
    'reportingManager',
    'status',
  ];
  fields.forEach((field) => {
  if (req.body[field] !== undefined) {
    employee[field] = req.body[field] === '' ? null : req.body[field];
  }
});

  await employee.save();

  if (req.body.fullName) {
    await User.findByIdAndUpdate(employee.user, { name: req.body.fullName });
  }

  const populated = await employee.populate([
    { path: 'employmentType', select: 'name' },
    { path: 'reportingManager', select: 'fullName employeeId' },
  ]);

  res.json({ success: true, employee: populated });
});

// @desc    Delete an employee (also removes their login account)
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  await User.findByIdAndDelete(employee.user);
  await employee.deleteOne();

  res.json({ success: true, message: 'Employee removed' });
});

// @desc    Get list of employees 
// @route   GET /api/employees/managers/list
// @access  Private/Admin
const getManagerOptions = asyncHandler(async (req, res) => {
  const managers = await Employee.find({ status: 'Active' }).select('fullName employeeId designation');
  res.json({ success: true, managers });
});

// @desc    Admin resets an employee's password (custom or random temporary password)
// @route   PUT /api/employees/:id/reset-password
// @access  Private/Admin
const resetPassword = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  let { newPassword } = req.body;
  if (!newPassword) {
    newPassword = 'Temp' + Math.random().toString(36).slice(-6) + '!1'; 
  }

  const user = await User.findById(employee.user);
  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully', temporaryPassword: newPassword });
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getManagerOptions,
  resetPassword,
};
