const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// ✅ Register and Return JWT Token
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailLowerCase = email.toLowerCase();
    const userExists = await User.findOne({ email: emailLowerCase });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("🔐 Hashed Password Before Saving:", hashedPassword);

    const user = new User({ username, email: emailLowerCase, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ✅ Login and Return JWT Token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailLowerCase = email.toLowerCase();
    const user = await User.findOne({ email: emailLowerCase });

    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    console.log("🔍 Stored Hashed Password:", user.password);
    console.log("🔑 Entered Password:", password);

    const isMatch = await user.comparePassword(password);
    console.log("✅ Password Match Result:", isMatch);

    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ✅ Protected Route
router.get('/dashboard', async (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Welcome to the Dashboard!', user });
  } catch (error) {
    console.error('Dashboard Access Error:', error);
    res.status(400).json({ message: 'Invalid token' });
  }
});

// ✅ Logout Route
router.post('/logout', async (req, res) => {
  res.json({ message: 'Logout successful. Remove token from localStorage on the client.' });
});

module.exports = router;
