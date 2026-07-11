// Run with: npm run seed
// Creates the first Admin account from .env values, if one doesn't already exist.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email}`);
    process.exit(0);
  }

  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Super Admin',
    email: process.env.ADMIN_EMAIL || 'admin@hrms.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
  });

  console.log('Admin account created:');
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
