const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.generateRandomToken = () => crypto.randomBytes(32).toString('hex');
