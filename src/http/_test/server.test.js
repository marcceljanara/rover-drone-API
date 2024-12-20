import request from 'supertest';
import createServer from '../server.js'; // Sesuaikan path ke file createServer.js

let app;

beforeAll(() => {
  app = createServer(); // Inisialisasi server sebelum pengujian
});

describe('HTTP server', () => {
  it('should respond with 404 when requesting an unregistered route', async () => {
    // Action
    const response = await request(app).get('/unregisteredRoute');

    // Assert
    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'Rute tidak ditemukan',
    });
  });
});
