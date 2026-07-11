const asyncHandler = require('express-async-handler');
const EmploymentType = require('../models/EmploymentType');
const Employee = require('../models/Employee');

// @desc    Create an employment type with its leave policy
// @route   POST /api/employment-types
// @access  Private/Admin
const createEmploymentType = asyncHandler(async (req, res) => {
  const { name, description, leavePolicy } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }

  const exists = await EmploymentType.findOne({ name });
  if (exists) {
    res.status(400);
    throw new Error('An employment type with this name already exists');
  }

  const employmentType = await EmploymentType.create({
    name,
    description,
    leavePolicy: leavePolicy || [],
  });

  res.status(201).json({ success: true, employmentType });
});

// @desc    List all employment types
// @route   GET /api/employment-types
// @access  Private
const getEmploymentTypes = asyncHandler(async (req, res) => {
  const employmentTypes = await EmploymentType.find().sort({ name: 1 });
  res.json({ success: true, employmentTypes });
});

// @desc    Get single employment type
// @route   GET /api/employment-types/:id
// @access  Private
const getEmploymentTypeById = asyncHandler(async (req, res) => {
  const employmentType = await EmploymentType.findById(req.params.id);
  if (!employmentType) {
    res.status(404);
    throw new Error('Employment type not found');
  }
  res.json({ success: true, employmentType });
});

// @desc    Update name/description
// @route   PUT /api/employment-types/:id
// @access  Private/Admin
const updateEmploymentType = asyncHandler(async (req, res) => {
  const employmentType = await EmploymentType.findById(req.params.id);
  if (!employmentType) {
    res.status(404);
    throw new Error('Employment type not found');
  }

  if (req.body.name !== undefined) employmentType.name = req.body.name;
  if (req.body.description !== undefined) employmentType.description = req.body.description;

  await employmentType.save();
  res.json({ success: true, employmentType });
});

// @desc    Replace the leave policy (list of {leaveType, annualDays}) for an employment type
// @route   PUT /api/employment-types/:id/leave-policy
// @access  Private/Admin
const updateLeavePolicy = asyncHandler(async (req, res) => {
  const { leavePolicy } = req.body;

  if (!Array.isArray(leavePolicy)) {
    res.status(400);
    throw new Error('leavePolicy must be an array of { leaveType, annualDays }');
  }

  const employmentType = await EmploymentType.findById(req.params.id);
  if (!employmentType) {
    res.status(404);
    throw new Error('Employment type not found');
  }

  employmentType.leavePolicy = leavePolicy;
  await employmentType.save();

  res.json({ success: true, employmentType });
});

// @desc    Delete an employment type 
// @route   DELETE /api/employment-types/:id
// @access  Private/Admin
const deleteEmploymentType = asyncHandler(async (req, res) => {
  const inUse = await Employee.countDocuments({ employmentType: req.params.id });
  if (inUse > 0) {
    res.status(400);
    throw new Error(`Cannot delete - ${inUse} employee(s) are assigned to this employment type`);
  }

  const employmentType = await EmploymentType.findByIdAndDelete(req.params.id);
  if (!employmentType) {
    res.status(404);
    throw new Error('Employment type not found');
  }

  res.json({ success: true, message: 'Employment type removed' });
});

module.exports = {
  createEmploymentType,
  getEmploymentTypes,
  getEmploymentTypeById,
  updateEmploymentType,
  updateLeavePolicy,
  deleteEmploymentType,
};
