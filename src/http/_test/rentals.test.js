import pkg from 'pg';
import request from 'supertest';
import dotenv from 'dotenv';
import UsersTableTestHelper from '../../../tests/UserTableHelper.js';
import AuthenticationsTableTestHelper from '../../../tests/AuthenticationTableHelper.js';
import RentalsTableTestHelper from '../../../tests/RentalsTableTestHelper.js';
import DevicesTableTestHelper from '../../../tests/DevicesTableTestHelper.js';
import createServer from '../server.js';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool();

const registerAndLoginAdmin = async (server) => {
  const payload = {
    id: 'admin-12345',
    email: 'adminkeren@gmail.com',
    password: 'superadmin',
  };
  await UsersTableTestHelper.addAdmin(payload);

  const login = await request(server).post('/authentications')
    .send({ email: payload.email, password: payload.password });

  const { accessToken } = login.body.data;
  return accessToken;
};

const registerAndLoginUser = async (server) => {
  const payload = {
    id: 'user-12345',
    username: 'userkeren',
    email: 'userkeren@gmail.com',
    password: 'superuser',
  };
  await UsersTableTestHelper.addUser(payload);

  const login = await request(server).post('/authentications')
    .send({ email: payload.email, password: payload.password });

  const { accessToken } = login.body.data;
  return accessToken;
};

const addRentalPayload = (() => {
  const today = new Date();
  const tommorow = new Date(today);
  const threeDaysLater = new Date(today);

  // Sent startDate menjadi besok
  tommorow.setDate(today.getDate() + 1);

  // Set endDate menjadi 3 hari setelah hari ini
  threeDaysLater.setDate(today.getDate() + 3);

  // Format tanggal menjadi YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(tommorow),
    endDate: formatDate(threeDaysLater),
  };
});

describe('/rentals endpoint', () => {
  let server;
  let accessTokenAdmin;
  let accessTokenUser;

  beforeAll(async () => {
    server = createServer();
  });

  beforeEach(async () => {
    accessTokenAdmin = await registerAndLoginAdmin(server);
    accessTokenUser = await registerAndLoginUser(server);
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await RentalsTableTestHelper.cleanTable();
    await DevicesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /rentals', () => {
    it('should return response 201 and add new rental', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });

      // Action
      const response = await request(server)
        .post('/rentals')
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send(addRentalPayload());

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.id).toBeDefined();
    });
    it('should return response 400 if startDate or endDate is before today', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });

      // Action
      const response = await request(server)
        .post('/rentals')
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send({
          startDate: '2025-01-26',
          endDate: '2025-01-27',
        });

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('Tanggal mulai dan tanggal akhir tidak boleh kurang dari hari ini');
    });
    it('should return response 404 if device not available', async () => {
      // Arrange

      // Action
      const response = await request(server)
        .post('/rentals')
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send(
          addRentalPayload(),
        );

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('Tidak ada perangkat yang tersedia untuk disewakan');
    });
    it('should return response 403 if admin add rental', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });

      // Action
      const response = await request(server)
        .post('/rentals')
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send(addRentalPayload());

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(403);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('admin tidak bisa melakukan aksi mengajukan rental');
    });
  });

  describe('PUT /rentals/:id/status', () => {
    it('should return response code 200 and change status rental', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const responseRental = await request(server)
        .post('/rentals')
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send(addRentalPayload());
      const rentalId = responseRental.body.data.id;

      // Action
      const response = await request(server)
        .put(`/rentals/${rentalId}/status`)
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send({ rentalStatus: 'active' });

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
    });
    it('should return response code 404 if rental not found', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const rentalId = 'notfound';

      // Action
      const response = await request(server)
        .put(`/rentals/${rentalId}/status`)
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send({ rentalStatus: 'active' });

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('rental tidak ditemukan');
    });
  });

  describe('PUT /rentals/:id', () => {
    it('should return response code 200 and soft delete rental', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const responseRental = await request(server)
        .post('/rentals')
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send(addRentalPayload());
      const rentalId = responseRental.body.data.id;

      // Action
      const response = await request(server)
        .put(`/rentals/${rentalId}`)
        .set('Authorization', `Bearer ${accessTokenAdmin}`);

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
    });
    it('should return response code 404 if rental not found', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const rentalId = 'notfound';

      // Action
      const response = await request(server)
        .put(`/rentals/${rentalId}`)
        .set('Authorization', `Bearer ${accessTokenAdmin}`);

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('Rental tidak ditemukan');
    });
  });

  describe('GET /rentals', () => {
    it('should return response code 200 and return all rental data', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      await request(server)
        .post('/rentals')
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send(addRentalPayload());

      // Action
      const response = await request(server)
        .get('/rentals')
        .set('Authorization', `Bearer ${accessTokenAdmin}`);

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.rentals).toHaveLength(1);
    });
  });

  describe('GET /rentals/:id', () => {
    it('should return response code 200 and get detail rental', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const responseRental = await request(server)
        .post('/rentals')
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send(addRentalPayload());
      const rentalId = responseRental.body.data.id;

      // Action
      const response = await request(server)
        .get(`/rentals/${rentalId}`)
        .set('Authorization', `Bearer ${accessTokenAdmin}`);

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.rental.id).toBe(rentalId);
      expect(responseJson.data.rental).toBeDefined();
    });
    it('should return response code 404 if rental not found', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const rentalId = 'notfound';

      // Action
      const response = await request(server)
        .get(`/rentals/${rentalId}`)
        .set('Authorization', `Bearer ${accessTokenAdmin}`);

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('rental tidak ditemukan');
    });
  });

  describe('PUT /rentals/:id/cancel', () => {
    it('should return response code 200 and cancel rental', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const responseRental = await request(server)
        .post('/rentals')
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send(addRentalPayload());
      const rentalId = responseRental.body.data.id;

      // Action
      const response = await request(server)
        .put(`/rentals/${rentalId}/cancel`)
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send({ rentalStatus: 'cancelled' });

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
    });
    it('should return response code 404 if rental not found', async () => {
      // Arrange
      await DevicesTableTestHelper.addDevice({ id: 'device-123' });
      const rentalId = 'notfound';

      // Action
      const response = await request(server)
        .put(`/rentals/${rentalId}/cancel`)
        .set('Authorization', `Bearer ${accessTokenUser}`)
        .send({ rentalStatus: 'cancelled' });

      // Assert
      const responseJson = response.body;
      expect(response.statusCode).toBe(404);
      expect(responseJson.status).toBe('fail');
      expect(responseJson.message).toBe('rental tidak ditemukan');
    });
  });
});
