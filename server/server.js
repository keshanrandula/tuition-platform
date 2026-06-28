const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedData = require('./config/seeder');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  // Run Database Seeder
  seedData();
});

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes mapping
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/classes', require('./routes/class.routes'));
app.use('/api/videos', require('./routes/video.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/notices', require('./routes/notice.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/progress', require('./routes/progress.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Serve frontend in production (if build folder exists)
const frontendDistPath = path.resolve(__dirname, '../client/dist');
const indexHtmlPath = path.join(frontendDistPath, 'index.html');

if (process.env.NODE_ENV === 'production' && fs.existsSync(indexHtmlPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  app.get('/', (req, res) => {
    res.send('Tuition Platform Server is running...');
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'An internal server error occurred',
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
