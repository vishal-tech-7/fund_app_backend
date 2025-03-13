const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema definition
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Username must be unique
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email must be unique
  },
  password: {
    type: String,
    required: true,
  },
});

// Pre-save middleware for hashing the password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Only hash the password if it is modified
  const salt = await bcrypt.genSalt(10); // Generate salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// User model
const User = mongoose.model('User', userSchema);

module.exports = User;
