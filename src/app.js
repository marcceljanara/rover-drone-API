import express from 'express';
import dotenv from 'dotenv';

import usersPlugin from './api/users/index.js';
import UserService from './services/postgres/UserServices.js';
import EmailManager from './utils/EmailManager.js';
import UsersValidator from './validator/users/index.js';
import ClientError from './exceptions/ClientError.js';

dotenv.config();

const app = express();
app.use(express.json());

// Dependency Injection
const userService = new UserService();
const emailManager = new EmailManager();

usersPlugin({
  app, userService, emailManager, validator: UsersValidator,
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  // Jika error merupakan instance ClientError
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Error lain (500 - Internal Server Error)
  console.error(err); // Log untuk debugging
  return res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server',
  });
});

// Middleware jika rute tidak ditemukan (404)
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Rute tidak ditemukan',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
