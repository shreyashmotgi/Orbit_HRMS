const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Employee = require('../models/Employee');
const generateToken = require('../utils/generateToken');

// @desc    Login (used by both Admin and Employee - role is determined server-side)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact your administrator.');
  }

   let profile = null;
  if (user.role === 'employee') {
    profile = await Employee.findOne({ user: user._id }).populate('employmentType', 'name');
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    },
    profile,
  });
});

// @desc    Get currently logged-in user's own details (used to restore session on refresh)
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  let profile = null;
  if (user.role === 'employee') {
    profile = await Employee.findOne({ user: user._id }).populate('employmentType', 'name');
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    profile,
  });
});

// @desc    Logout - JWT is stateless, so this simply tells the client to discard its token
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Update own phone number 
// @route   PUT /api/auth/profile
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== 'employee') {
    res.status(403);
    throw new Error('Only employees can update their phone number');
  }
  const { phoneNumber } = req.body;
  if (phoneNumber === undefined) {
    res.status(400);
    throw new Error('phoneNumber is required');
  }
  const employee = await Employee.findOneAndUpdate(
    { user: req.user._id },
    { phoneNumber },
    { new: true }
  );
  if (!employee) {
    res.status(404);
    throw new Error('No employee profile linked to this account');
  }
  res.json({ success: true, message: 'Profile updated' });
});

// @desc    Change own password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('currentPassword and newPassword are required');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  const matches = await user.matchPassword(currentPassword);
  if (!matches) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword; 
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { login, getMe, logout, updateMyProfile, changePassword };