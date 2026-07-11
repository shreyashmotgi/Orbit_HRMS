const asyncHandler = require('express-async-handler');
const Holiday = require('../models/Holiday');

// @desc    Add a holiday
// @route   POST /api/holidays
// @access  Private/Admin
const createHoliday = asyncHandler(async (req, res) => {
  const { name, date, description } = req.body;
  if (!name || !date) {
    res.status(400);
    throw new Error('Name and date are required');
  }
  const holiday = await Holiday.create({ name, date, description });
  res.status(201).json({ success: true, holiday });
});

// @desc    List holidays, optionally filtered by year
// @route   GET /api/holidays?year=
// @access  Private
const getHolidays = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.year) {
    const y = parseInt(req.query.year, 10);
    query.date = {
      $gte: new Date(Date.UTC(y, 0, 1)),
      $lte: new Date(Date.UTC(y, 11, 31, 23, 59, 59)),
    };
  }
  const holidays = await Holiday.find(query).sort({ date: 1 });
  res.json({ success: true, holidays });
});

// @desc    Update a holiday
// @route   PUT /api/holidays/:id
// @access  Private/Admin
const updateHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findById(req.params.id);
  if (!holiday) {
    res.status(404);
    throw new Error('Holiday not found');
  }
  ['name', 'date', 'description'].forEach((field) => {
    if (req.body[field] !== undefined) holiday[field] = req.body[field];
  });
  await holiday.save();
  res.json({ success: true, holiday });
});

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private/Admin
const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id);
  if (!holiday) {
    res.status(404);
    throw new Error('Holiday not found');
  }
  res.json({ success: true, message: 'Holiday removed' });
});

module.exports = { createHoliday, getHolidays, updateHoliday, deleteHoliday };
