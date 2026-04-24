/**
 * Run once to create an admin user:
 *   node src/utils/seedAdmin.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({ email: 'admin@shop.com' });

if (existing) {
  existing.passwordHash = 'Admin@1234';
  existing.role = 'admin';
  await existing.save();
  console.log('✅ Admin password updated to: Admin@1234');
} else {
  await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@shop.com',
    passwordHash: 'Admin@1234',
    role: 'admin',
  });
  console.log('✅ Admin created — email: admin@shop.com  password: Admin@1234');
}

await mongoose.disconnect();
