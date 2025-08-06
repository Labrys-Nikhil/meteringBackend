const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      console.error('Authorization header missing');
      return res.status(401).json({ message: 'Access denied: No auth header' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.error('Token not found in auth header:', authHeader);
      return res.status(401).json({ message: 'Access denied: Token missing' });
    }

    console.log('Checking token...');
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };
