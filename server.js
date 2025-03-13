require('dotenv').config(); // Load .env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import authentication routes

const app = express();
app.use(express.json());

app.use(cors({ origin: 'https://fund-app-frontend-a4iv.onrender.com', credentials: true })); // Enable CORS for cross-origin requests

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/fund_db';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Authentication Routes
app.use('/api/auth', authRoutes);

// Server listening
app.listen(5000, () => console.log('Server running on port 5000'));
