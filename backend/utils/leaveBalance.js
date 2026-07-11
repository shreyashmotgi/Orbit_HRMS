const Employee = require('../models/Employee');
const EmploymentType = require('../models/EmploymentType');
const LeaveRequest = require('../models/LeaveRequest');

/**
 * Computes leave balance (Available / Used / Remaining) for every leave type
 * defined in the employee's employment type policy, for the given calendar year.
 * Only "Approved" leave requests count as "Used".
 */
async function getLeaveBalance(employeeId, year = new Date().getFullYear()) {
  const employee = await Employee.findById(employeeId).populate('employmentType');
  if (!employee) throw new Error('Employee not found');

  const policy = employee.employmentType?.leavePolicy || [];

  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  const approvedLeaves = await LeaveRequest.find({
    employee: employeeId,
    status: 'Approved',
    fromDate: { $lte: yearEnd },
    toDate: { $gte: yearStart },
  });

  const usedByType = {};
  for (const leave of approvedLeaves) {
    usedByType[leave.leaveType] = (usedByType[leave.leaveType] || 0) + leave.totalDays;
  }

  const balance = policy.map((item) => {
    const used = usedByType[item.leaveType] || 0;
    const isUnlimited = item.annualDays >= 999;
    return {
      leaveType: item.leaveType,
      available: isUnlimited ? 'Unlimited' : item.annualDays,
      used,
      remaining: isUnlimited ? 'Unlimited' : Math.max(item.annualDays - used, 0),
    };
  });

  return balance;
}

/** Returns remaining balance (as a number, Infinity if unlimited) for a single leave type. */
async function getRemainingForType(employeeId, leaveType, year = new Date().getFullYear()) {
  const balance = await getLeaveBalance(employeeId, year);
  const entry = balance.find((b) => b.leaveType === leaveType);
  if (!entry) return 0;
  return entry.remaining === 'Unlimited' ? Infinity : entry.remaining;
}

module.exports = { getLeaveBalance, getRemainingForType };
