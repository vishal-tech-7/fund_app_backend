const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Invalid Token:", error);
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateToken;
