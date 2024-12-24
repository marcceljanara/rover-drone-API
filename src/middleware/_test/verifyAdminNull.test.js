import request from 'supertest';
import express from 'express';
import verifyAdmin from '../verifyAdmin.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';

// Membuat aplikasi Express untuk pengujian
const app = express();

// Middleware untuk mensimulasikan penambahan role ke `req`
app.use((req, res, next) => {
  req.role = null; // Default role null
  next();
});

// Middleware yang akan diuji
app.use('/admin', verifyAdmin, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Access granted',
  });
});

describe('verifyAdmin Middleware', () => {
  it('should return 403 if role is missing', async () => {
    // Simulasikan tidak ada role
    app.use((req, res, next) => {
      req.role = null;
      next();
    });

    const response = await request(app).get('/admin');
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'Role tidak ditemukan dalam token',
    });
  });

  it('should return 500 for unexpected errors', async () => {
    jest.spyOn(AuthorizationError.prototype, 'constructor').mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const response = await request(app).get('/admin');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });

    // Reset mocking
    AuthorizationError.prototype.constructor.mockRestore();
  });
});
