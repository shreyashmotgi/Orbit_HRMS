const asyncHandler = require('express-async-handler');
const AttendanceLog = require('../models/AttendanceLog');
const Employee = require('../models/Employee');
const { toDateKey } = require('../utils/dateHelpers');

const OFFICE_START_HOUR = 9;
const OFFICE_START_MINUTE = 30;

// Recomputes totalWorkingMinutes, totalBreakMinutes, isLate and status from the punches array.
function recalculate(log) {
  const punches = [...log.punches].sort((a, b) => new Date(a.time) - new Date(b.time));

  let workingMinutes = 0;
  let breakMinutes = 0;
  let lastOutTime = null;

  for (let i = 0; i < punches.length; i++) {
    const current = punches[i];
    if (current.type === 'in') {
      if (lastOutTime) {
        breakMinutes += (new Date(current.time) - new Date(lastOutTime)) / 60000;
      }
    } else if (current.type === 'out') {
      const prevIn = [...punches.slice(0, i)].reverse().find((p) => p.type === 'in');
      if (prevIn) {
        workingMinutes += (new Date(current.time) - new Date(prevIn.time)) / 60000;
      }
      lastOutTime = current.time;
    }
  }

  const firstIn = punches.find((p) => p.type === 'in');
  let isLate = false;
  if (firstIn) {
    const t = new Date(firstIn.time);
    const officeStart = new Date(t);
    officeStart.setHours(OFFICE_START_HOUR, OFFICE_START_MINUTE, 0, 0);
    isLate = t > officeStart;
  }

  let status = 'Absent';
  if (workingMinutes >= 240) status = 'Present'; 
  else if (workingMinutes > 0) status = 'Half Day';

  log.punches = punches;
  log.totalWorkingMinutes = Math.round(workingMinutes);
  log.totalBreakMinutes = Math.round(breakMinutes);
  log.isLate = isLate;
  log.status = status;
  return log;
}

async function getEmployeeIdForUser(req) {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) {
    const err = new Error('No employee profile linked to this account');
    err.statusCode = 404;
    throw err;
  }
  return employee._id;
}

// @desc    Punch In
// @route   POST /api/attendance/punch-in
// @access  Private/Employee
const punchIn = asyncHandler(async (req, res) => {
  const employeeId = await getEmployeeIdForUser(req);
  const now = new Date();
  const dateKey = toDateKey(now);

  let log = await AttendanceLog.findOne({ employee: employeeId, date: dateKey });
  if (!log) {
    log = new AttendanceLog({ employee: employeeId, date: dateKey, punches: [] });
  }

  const last = log.punches[log.punches.length - 1];
  if (last && last.type === 'in') {
    res.status(400);
    throw new Error('You are already punched in. Please punch out first.');
  }

  log.punches.push({ type: 'in', time: now });
  recalculate(log);
  await log.save();

  res.json({ success: true, log });
});

// @desc    Punch Out
// @route   POST /api/attendance/punch-out
// @access  Private/Employee
const punchOut = asyncHandler(async (req, res) => {
  const employeeId = await getEmployeeIdForUser(req);
  const now = new Date();
  const dateKey = toDateKey(now);

  const log = await AttendanceLog.findOne({ employee: employeeId, date: dateKey });
  const last = log?.punches[log.punches.length - 1];
  if (!log || !last || last.type !== 'in') {
    res.status(400);
    throw new Error('You must punch in before punching out.');
  }

  log.punches.push({ type: 'out', time: now });
  recalculate(log);
  await log.save();

  res.json({ success: true, log });
});

// @desc    Get today's attendance status for the logged-in employee (dashboard widget)
// @route   GET /api/attendance/today
// @access  Private/Employee
const getToday = asyncHandler(async (req, res) => {
  const employeeId = await getEmployeeIdForUser(req);
  const dateKey = toDateKey(new Date());

  const log = await AttendanceLog.findOne({ employee: employeeId, date: dateKey });
  const last = log?.punches[log.punches.length - 1];

  res.json({
    success: true,
    log: log || null,
    currentlyPunchedIn: !!last && last.type === 'in',
  });
});

// @desc    Get the logged-in employee's own attendance history (for calendar view)
// @route   GET /api/attendance/my-history?month=&year=
// @access  Private/Employee
const getMyHistory = asyncHandler(async (req, res) => {
  const employeeId = await getEmployeeIdForUser(req);
  const logs = await fetchMonthLogs(employeeId, req.query.month, req.query.year);
  res.json({ success: true, logs });
});

async function fetchMonthLogs(employeeId, month, year) {
  const now = new Date();
  const m = month ? parseInt(month, 10) - 1 : now.getMonth();
  const y = year ? parseInt(year, 10) : now.getFullYear();

  const start = new Date(Date.UTC(y, m, 1));
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59));

  return AttendanceLog.find({
    employee: employeeId,
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });
}

// @desc    Admin: view attendance with filters (employee, date range, month)
// @route   GET /api/attendance?employee=&from=&to=&month=&year=
// @access  Private/Admin
const getAttendanceAdmin = asyncHandler(async (req, res) => {
  const { employee, from, to, month, year } = req.query;
  const query = {};
  if (employee) query.employee = employee;

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = toDateKey(from);
    if (to) query.date.$lte = toDateKey(to);
  } else if (month && year) {
    const m = parseInt(month, 10) - 1;
    const y = parseInt(year, 10);
    query.date = {
      $gte: new Date(Date.UTC(y, m, 1)),
      $lte: new Date(Date.UTC(y, m + 1, 0, 23, 59, 59)),
    };
  }

  const logs = await AttendanceLog.find(query)
    .populate('employee', 'fullName employeeId designation')
    .sort({ date: -1 });

  res.json({ success: true, count: logs.length, logs });
});

module.exports = {
  punchIn,
  punchOut,
  getToday,
  getMyHistory,
  getAttendanceAdmin,
  fetchMonthLogs, // exported for reuse by the payroll calculator
  OFFICE_START_HOUR,
  OFFICE_START_MINUTE,
};
