const db = require('../db');

const User = {
  create: (full_name, username, email, passwordHash, role, phone, callback) => {
    db.query(
      'INSERT INTO users (full_name, username, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, username, email, passwordHash, role, phone],
      callback
    );
  },

  findByUsernameOrEmail: (identifier, callback) => {
    db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier],
      callback
    );
  }
};

module.exports = User;
