import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/issat';

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI.trim());
    console.log('✅ Connected to MongoDB');

    const users = await User.find().select('email role');
    console.log(`\n📊 Found ${users.length} users in database:`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found! Please run: npm run seed');
    } else {
      users.forEach((user) => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();

