const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Verify environment variables
console.log('Environment check:', {
  emailUser: process.env.EMAIL_USER ? 'Set' : 'Missing',
  emailPass: process.env.EMAIL_PASS ? 'Set' : 'Missing',
  mongoUri: process.env.MONGODB_URI ? 'Set' : 'Missing',
  jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Missing'
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
  console.log('Database:', mongoose.connection.db.databaseName);
  console.log('Collections:', Object.keys(mongoose.connection.collections));
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 