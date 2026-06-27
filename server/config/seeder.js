const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Week = require('../models/Week');
const Video = require('../models/Video');
const Class = require('../models/Class');
const VideoSet = require('../models/VideoSet');

const seedData = async () => {
  try {
    // Check if database already has users/data
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already populated. Skipping seeder.');
      return;
    }

    console.log('Seeding initial mock data into database...');

    // 1. Create Default Users (Admin and Student)
    const adminUser = new User({
      name: 'Professor Smith (Admin)',
      email: 'admin@tuition.com',
      password: 'admin123', // Will be hashed in pre-save hook
      role: 'admin',
      isEmailVerified: true,
      idNumber: '000000000V',
      phoneNumber: '0770000000'
    });

    const studentUser = new User({
      name: 'Jane Doe (Student)',
      email: 'student@tuition.com',
      password: 'student123',
      role: 'student',
      isEmailVerified: true,
      idNumber: '990000000V',
      phoneNumber: '0771234567'
    });

    await adminUser.save();
    await studentUser.save();
    console.log('-> Users seeded: Admin (admin@tuition.com/admin123), Student (student@tuition.com/student123)');

    // 2. Create Weeks
    const week1 = await Week.create({
      weekNumber: 1,
      subject: 'Mathematics',
      title: 'Algebra Fundamentals',
      description: 'Master the basics of variables, linear functions, and coordinate graphing. Highly recommended prerequisite.',
      price: 0, // Free Week
      isLockedByDefault: false,
      resources: [
        {
          title: 'Algebra Basics Lecture Handout (PDF)',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        {
          title: 'Linear Graphs Practice Assignment',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
      ]
    });

    const week2 = await Week.create({
      weekNumber: 2,
      subject: 'Mathematics',
      title: 'Quadratic Equations',
      description: 'Learn how to factor trinomials, complete the square, and apply the quadratic formula in real-world problems.',
      price: 25, // Locked Week
      isLockedByDefault: true,
      resources: [
        {
          title: 'Quadratic Equations Deep-Dive Guide',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        }
      ]
    });

    const week3 = await Week.create({
      weekNumber: 3,
      subject: 'Physics',
      title: 'Calculus & Limits',
      description: 'Introduction to rates of change, slopes of tangent lines, and the foundational limit definition of a derivative.',
      price: 45, // Locked Week
      isLockedByDefault: true
    });
    console.log('-> Course Weeks seeded (Week 1 is Free, Weeks 2 & 3 are Paid)');

    // 3. Create Videos linked to Weeks
    const v1 = await Video.create({
      title: 'Introduction to Polynomials',
      description: 'A friendly overview of constants, exponents, and polynomial definitions.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400',
      duration: 350,
      week: week1._id
    });

    const v2 = await Video.create({
      title: 'Factoring Trinomials Quick-Guide',
      description: 'A step-by-step tutorial on splitting the middle term and factoring expressions.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400',
      duration: 520,
      week: week2._id
    });

    const v3 = await Video.create({
      title: 'Understanding the Slope of Tangents',
      description: 'Visual demonstration showing how secant lines approach tangent lines in limits.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1453733190148-c44698c26588?auto=format&fit=crop&q=80&w=400',
      duration: 720,
      week: week3._id
    });
    console.log('-> Videos seeded for weeks');

    // 4. Create Live Classes linked to Weeks (Skipped to avoid fake details)
    console.log('-> Live Classes seeding skipped to avoid fake details');

    // 5. Create Standalone VideoSets
    const phySet = await VideoSet.create({
      title: 'Physics Mechanics Crash Course',
      description: 'Full comprehensive review package covering vectors, kinematics, Newton\'s laws, and energy conservation. Includes 5 key tutorial modules.',
      price: 99,
      thumbnailUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400',
    });

    const chemSet = await VideoSet.create({
      title: 'Chemistry Bonding & Orbitals',
      description: 'Master valence shells, hybridization theory, covalent/ionic bonds, and Lewis structures. Clear animations and problem worksheets.',
      price: 79,
      thumbnailUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=400',
    });
    console.log('-> Standalone Video Sets seeded');

    // 6. Create Videos for Standalone sets
    await Video.create({
      title: 'Newtonian Dynamics Overview',
      description: 'An introductory lecture on mass, weight, friction, and pulling forces on inclined planes.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=400',
      duration: 900,
      videoSet: phySet._id
    });

    await Video.create({
      title: 'Covalent Bonding Deep Dive',
      description: 'Understanding sigma and pi bonds and how electron sharing forms diatomic molecules.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=400',
      duration: 800,
      videoSet: chemSet._id
    });
    console.log('-> Videos seeded for Standalone sets');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeder execution error:', error);
  }
};

module.exports = seedData;
