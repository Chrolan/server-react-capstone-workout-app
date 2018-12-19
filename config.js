'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/react-capstone';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'Jordi#1234';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '3d';