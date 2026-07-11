const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, 
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dateOfJoining: {
      type: Date,
      required: [true, 'Date of joining is required'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    monthlySalary: {
      type: Number,
      required: [true, 'Monthly salary is required'],
      min: 0,
    },
    employmentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmploymentType',
      required: [true, 'Employment type is required'],
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

employeeSchema.index({ fullName: 'text', email: 'text', designation: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
