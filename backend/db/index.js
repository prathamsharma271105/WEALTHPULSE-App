const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const Goal = require('../models/Goal');
const Investment = require('../models/Investment');
const Feedback = require('../models/Feedback');

let mongoUri = (process.env.MONGODB_URI || '').trim();

async function init() {
  try {
    let uriToConnect = mongoUri;

    if (!uriToConnect) {
      uriToConnect = 'mongodb://127.0.0.1:27017/wealthpulse';
    }

    console.log(`[db] Connecting to MongoDB: ${uriToConnect.startsWith('mongodb+srv://') ? 'MongoDB Atlas (Cloud)' : uriToConnect}...`);

    try {
      await mongoose.connect(uriToConnect, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[db] Connected to MongoDB successfully.');
    } catch (connErr) {
      console.warn('[db] Direct MongoDB connection failed:', connErr.message);
      
      // Try optional mongodb-memory-server if available for local development without local mongod
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        console.log('[db] Starting embedded in-memory MongoDB fallback...');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log('[db] Connected to embedded in-memory MongoDB successfully.');
      } catch (memErr) {
        throw new Error(
          `Could not connect to MongoDB at ${uriToConnect}. Please verify your MONGODB_URI in .env or make sure MongoDB is running. Details: ${connErr.message}`
        );
      }
    }

    // Seed default admin user
    try {
      const email = (process.env.ADMIN_EMAIL || 'admin@financetrack.com').trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
      const existing = await User.findOne({ email });
      if (!existing) {
        const hash = bcrypt.hashSync(password, 10);
        await User.create({
          name: 'Admin',
          email,
          password_hash: hash,
          role: 'admin',
          currency: 'INR',
        });
        console.log(`[seed] Admin user seeded successfully -> ${email}`);
      }
    } catch (seedErr) {
      console.error('[seed] Admin seeding error:', seedErr);
    }
  } catch (err) {
    console.error('[db] MongoDB initialization error:', err.message);
    throw err;
  }
}

module.exports = {
  mongoose,
  init,
  User,
  Income,
  Expense,
  Habit,
  HabitLog,
  Goal,
  Investment,
  Feedback,
};
