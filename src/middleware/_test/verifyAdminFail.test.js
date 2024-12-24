import request from 'supertest';
import express from 'express';
import verifyAdmin from '../verifyAdmin.js';

// Membuat aplikasi Express untuk pengujian
const app = express();

// Middleware untuk mensimulasikan penambahan role ke `req`
app.use((req, res, next) => {
  req.role = 'user'; // Default role null
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
  it('should return 403 if role is not admin', async () => {
    // Simulasikan role bukan admin
    app.use((req, res, next) => {
      req.role = 'user';
      next();
    });

    const response = await request(app).get('/admin');
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'Anda tidak memiliki akses',
    });
  });
});
