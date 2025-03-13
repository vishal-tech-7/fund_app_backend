const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User Model

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Ensure secret key is set

// ✅ Register and Return JWT Token
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Convert email to lowercase to prevent duplicates
    const emailLowerCase = email.toLowerCase();

    // Check if the user already exists
    const userExists = await User.findOne({ email: emailLowerCase });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({ username, email: emailLowerCase, password: hashedPassword });
    await user.save();

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Login and Return JWT Token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailLowerCase = email.toLowerCase(); // Standardize email format
    const user = await User.findOne({ email: emailLowerCase });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Protected Route (Token Check without Middleware)
router.get('/dashboard', async (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password'); // Exclude password

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Welcome to the Dashboard!', user });
  } catch (error) {
    console.error('Dashboard Access Error:', error);
    res.status(400).json({ message: 'Invalid token' });
  }
});

// ✅ Logout Route (Client should delete token)
router.post('/logout', async (req, res) => {
  res.json({ message: 'Logged out successfully' }); // Token should be removed from frontend storage
});

module.exports = router;
