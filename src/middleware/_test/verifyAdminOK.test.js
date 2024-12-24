import request from 'supertest';
import express from 'express';
import verifyAdmin from '../verifyAdmin.js';

// Membuat aplikasi Express untuk pengujian
const app = express();

// Middleware untuk mensimulasikan penambahan role ke `req`
app.use((req, res, next) => {
  req.role = 'admin'; // Default role null
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
  it('should allow access if role is admin', async () => {
    // Simulasikan role admin
    app.use((req, res, next) => {
      req.role = 'admin';
      next();
    });

    const response = await request(app).get('/admin');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Access granted',
    });
  });
});
