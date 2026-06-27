const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuition-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Database connection error: ${err.message}`);
    process.exit(1);
  }
};

const clearData = async () => {
  await connectDB();
  try {
    console.log('Clearing database collections...');
    
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
      console.log(`Cleared collection: ${key}`);
    }

    console.log('Database successfully cleared!');
    
    console.log('Creating default Admin account...');
    const adminUser = new User({
      name: 'Professor Smith (Admin)',
      email: 'admin@tuition.com',
      password: 'admin123', // Will be hashed in pre-save hook
      role: 'admin',
      isEmailVerified: true,
      idNumber: '000000000V',
      phoneNumber: '0770000000'
    });
    await adminUser.save();
    console.log('Admin account created successfully! Credentials: admin@tuition.com / admin123');

  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

clearData();
