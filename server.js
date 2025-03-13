require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import authentication routes

const app = express();
app.use(express.json());

// Enable CORS for frontend communication
app.use(cors({ origin: 'https://fund-app-frontend-a4iv.onrender.com', credentials: true }));

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fund_db';

// Connect to MongoDB
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1); // Exit the process if DB connection fails
  });

// Authentication Routes
app.use('/api/auth', authRoutes);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server only if MongoDB is connected
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Graceful Shutdown (CTRL+C or Server Crash)
process.on('SIGINT', async () => {
  console.log('❗ Server shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});
