const mongoose = require('mongoose');

const punchSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['in', 'out'], required: true },
    time: { type: Date, required: true },
  },
  { _id: false }
);

const attendanceLogSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    punches: {
      type: [punchSchema],
      default: [],
    },
    totalWorkingMinutes: {
      type: Number, 
      default: 0,
    },
    totalBreakMinutes: {
      type: Number,
      default: 0,
    },
    isLate: {
      type: Boolean, 
      default: false,
    },
    status: {
      type: String,
      enum: ['Present', 'Half Day', 'Absent'],
      default: 'Present',
    },
  },
  { timestamps: true }
);

attendanceLogSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
