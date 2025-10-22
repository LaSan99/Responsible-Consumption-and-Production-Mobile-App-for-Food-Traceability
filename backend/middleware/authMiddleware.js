const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  
  const token = authHeader?.split(' ')[1];
  console.log('Token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('Token verified for user:', decoded.id);
    req.user = decoded;
    next();
  });
};
