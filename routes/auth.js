const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// ✅ REGISTER (Sign Up)
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailLowerCase = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: emailLowerCase });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    // ✅ Ensure password is hashed only ONCE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("🔐 Hashed Password Before Saving:", hashedPassword);

    const user = new User({ username, email: emailLowerCase, password: hashedPassword });
    await user.save();

    // ✅ Fetch saved user & verify password is stored correctly
    const savedUser = await User.findOne({ email: emailLowerCase });
    console.log("✅ Stored Hashed Password in DB:", savedUser.password);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ✅ LOGIN (Sign In)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailLowerCase = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLowerCase });

    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    console.log("🔍 Stored Hashed Password in DB:", user.password);
    console.log("🔑 Entered Password (Before Hashing):", password);

    // ✅ Fix: Ensure bcrypt.compare() is working correctly
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("✅ Password Match Result:", isMatch);

    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ✅ LOGOUT (Handled by frontend removing the token)
router.post('/logout', async (req, res) => {
  res.json({ message: 'Logout successful. Remove token from localStorage on the client.' });
});

module.exports = router;
