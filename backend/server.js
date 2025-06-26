const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const packingRoutes = require('./routes/packingRoutes');

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trip_packer';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/packing', packingRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
