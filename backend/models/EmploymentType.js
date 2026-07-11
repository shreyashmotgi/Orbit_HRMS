const mongoose = require('mongoose');

const leavePolicyItemSchema = new mongoose.Schema(
  {
    leaveType: { type: String, required: true, trim: true },
    annualDays: { type: Number, required: true, min: 0 }, 
  },
  { _id: false }
);

const employmentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Employment type name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    leavePolicy: {
      type: [leavePolicyItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmploymentType', employmentTypeSchema);
