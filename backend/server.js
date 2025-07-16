// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const axios = require('axios');

// Import Firebase config
require('./config/firebase');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const packingRoutes = require('./routes/packingRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const travelTipsRoutes = require('./routes/travelTipsRoutes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS middleware for production
app.use((req, res, next) => {
  // Get allowed origins from environment or use defaults
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:19006',
    'exp://localhost:19000',
    'exp://26.219.207.197:19000',
    'http://26.219.207.197:3000',
    'http://26.219.207.197:8081',
        'http://26.219.207.197:19006',
        // Add your production domains here
        'https://your-production-domain.com',
        'https://tripwiser.app',
        'https://tripwiser.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/trip_packer';

// Always attempt MongoDB connection (for both development and production)
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => console.log('MongoDB connected successfully...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Make sure MongoDB is running locally or set MONGODB_URI environment variable');
    // Don't exit the process, just log the error
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/travel-tips', travelTipsRoutes);

app.get('/', (req, res) => {
  res.send('TripWiser Backend Server is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TripWiser Backend is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Keep-alive endpoint for self-pinging
app.get('/ping', (req, res) => {
  res.json({ 
    status: 'pong', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server accessible at: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);
});

// Self-pinging mechanism to prevent Render from spinning down
let pingInterval;
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  const pingUrl = `${process.env.RENDER_EXTERNAL_URL}/ping`;
  
  // Ping every 10 minutes (600,000 ms)
  pingInterval = setInterval(async () => {
    try {
      const response = await axios.get(pingUrl, { timeout: 10000 });
      console.log(`Self-ping successful: ${response.data.status} at ${response.data.timestamp}`);
    } catch (error) {
      console.error('Self-ping failed:', error.message);
    }
  }, 10 * 60 * 1000); // 10 minutes
  
  console.log('Self-pinging mechanism enabled - pinging every 10 minutes');
}

// Global error handlers to prevent server from crashing silently
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack trace:', err.stack);
  // Don't exit the process, just log the error
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (pingInterval) {
    clearInterval(pingInterval);
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (pingInterval) {
    clearInterval(pingInterval);
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
