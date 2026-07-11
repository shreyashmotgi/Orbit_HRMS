const asyncHandler = require('express-async-handler');
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const { calculateLeaveTotalDays } = require('../utils/dateHelpers');
const { getLeaveBalance, getRemainingForType } = require('../utils/leaveBalance');

async function getEmployeeForUser(req) {
  const employee = await Employee.findOne({ user: req.user._id }).populate('employmentType');
  if (!employee) {
    const err = new Error('No employee profile linked to this account');
    err.statusCode = 404;
    throw err;
  }
  return employee;
}

// @desc    Apply for leave (full day, half day, or multi-day)
// @route   POST /api/leaves
// @access  Private/Employee
const applyLeave = asyncHandler(async (req, res) => {
  const employee = await getEmployeeForUser(req);
  const { leaveType, fromDate, toDate, isHalfDay, halfDaySession, reason } = req.body;

  if (!leaveType || !fromDate || !toDate || !reason) {
    res.status(400);
    throw new Error('leaveType, fromDate, toDate and reason are required');
  }

  const validTypes = (employee.employmentType?.leavePolicy || []).map((p) => p.leaveType);
  if (!validTypes.includes(leaveType)) {
    res.status(400);
    throw new Error(`'${leaveType}' is not a valid leave type for your employment type`);
  }

  if (isHalfDay && fromDate !== toDate) {
    res.status(400);
    throw new Error('Half day leave must have the same from and to date');
  }
  if (isHalfDay && !halfDaySession) {
    res.status(400);
    throw new Error('Please specify First Half or Second Half for a half-day leave');
  }

  const totalDays = calculateLeaveTotalDays({ fromDate, toDate, isHalfDay });

  const remaining = await getRemainingForType(employee._id, leaveType);
  if (remaining !== Infinity && totalDays > remaining) {
    res.status(400);
    throw new Error(`Insufficient ${leaveType} balance. Remaining: ${remaining}, Requested: ${totalDays}`);
  }

  const leave = await LeaveRequest.create({
    employee: employee._id,
    leaveType,
    fromDate,
    toDate,
    isHalfDay: !!isHalfDay,
    halfDaySession: isHalfDay ? halfDaySession : null,
    reason,
    totalDays,
  });

  res.status(201).json({ success: true, leave });
});

// @desc    Get logged-in employee's own leave requests
// @route   GET /api/leaves/my
// @access  Private/Employee
const getMyLeaves = asyncHandler(async (req, res) => {
  const employee = await getEmployeeForUser(req);
  const leaves = await LeaveRequest.find({ employee: employee._id }).sort({ createdAt: -1 });
  res.json({ success: true, leaves });
});

// @desc    Get logged-in employee's leave balance
// @route   GET /api/leaves/my/balance
// @access  Private/Employee
const getMyBalance = asyncHandler(async (req, res) => {
  const employee = await getEmployeeForUser(req);
  const balance = await getLeaveBalance(employee._id, req.query.year ? parseInt(req.query.year, 10) : undefined);
  res.json({ success: true, balance });
});

// @desc    Admin: list all leave requests, optionally filtered by status/employee
// @route   GET /api/leaves?status=&employee=
// @access  Private/Admin
const getAllLeaves = asyncHandler(async (req, res) => {
  const { status, employee } = req.query;
  const query = {};
  if (status) query.status = status;
  if (employee) query.employee = employee;

  const leaves = await LeaveRequest.find(query)
    .populate('employee', 'fullName employeeId designation')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: leaves.length, leaves });
});

// @desc    Admin: approve or reject a leave request
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  if (!['Approved', 'Rejected'].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'Approved' or 'Rejected'");
  }

  const leave = await LeaveRequest.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  if (leave.status !== 'Pending') {
    res.status(400);
    throw new Error(`This request was already ${leave.status.toLowerCase()}`);
  }

  if (status === 'Approved') {
    const remaining = await getRemainingForType(leave.employee, leave.leaveType);
    if (remaining !== Infinity && leave.totalDays > remaining) {
      res.status(400);
      throw new Error(`Cannot approve - insufficient ${leave.leaveType} balance (remaining: ${remaining})`);
    }
  }

  leave.status = status;
  leave.actionedBy = req.user._id;
  leave.actionedAt = new Date();
  leave.actionRemarks = remarks || '';
  await leave.save();

  res.json({ success: true, leave });
});

module.exports = {
  applyLeave,
  getMyLeaves,
  getMyBalance,
  getAllLeaves,
  updateLeaveStatus,
};
