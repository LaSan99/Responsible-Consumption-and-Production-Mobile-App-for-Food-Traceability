const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = (req, res) => {
  const { full_name, username, email, password, role, phone } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password required' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;

    User.create(full_name, username, email, hash, role || 'consumer', phone, (err) => {
      if (err) return res.status(500).json({ message: 'Error creating user', error: err });
      res.json({ message: 'User registered' });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findByUsernameOrEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error finding user' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token, role: user.role, full_name: user.full_name });
    });
  });
};
