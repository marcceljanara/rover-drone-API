import pkg from 'pg';
import { nanoid } from 'nanoid';
import NotFoundError from '../../exceptions/NotFoundError.js';

const { Pool } = pkg;

class DevicesService {
  constructor() {
    this._pool = new Pool();
  }

  async addDevice() {
    const id = `device-${nanoid(6)}`;
    const mqttControlTopic = `control/${id}/${nanoid(10)}`;
    const mqttSensorTopic = `sensor/${id}/${nanoid(10)}`;
    const status = 'inactive'; // default

    const query = {
      text: 'INSERT INTO devices (id, status, last_active, sensor_topic, control_topic) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, status, null, mqttSensorTopic, mqttControlTopic],
    };
    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async deleteDevice(id) {
    const query = {
      text: 'UPDATE devices SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }

  async changeStatusDevice(id, status) {
    const query = {
      text: 'UPDATE devices SET status = $1 WHERE id = $2 AND is_deleted = FALSE RETURNING id',
      values: [status, id],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }

  async changeMqttSensor(id) {
    const mqttSensorTopic = `sensor/${id}/${nanoid(12)}`;
    const query = {
      text: 'UPDATE devices SET sensor_topic = $1 WHERE id = $2 AND is_deleted = FALSE RETURNING id',
      values: [mqttSensorTopic, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }

  async changeMqttControl(id) {
    const mqttControlTopic = `control/${id}/${nanoid(12)}`;
    const query = {
      text: 'UPDATE devices SET control_topic = $1 WHERE id = $2 AND is_deleted = FALSE RETURNING id',
      values: [mqttControlTopic, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }

  async getAllDevice(userId, role) {
    // Jika role adalah admin, user dapat mengakses semua device
    if (role === 'admin') {
      const query = {
        text: 'SELECT id, rental_id, status, last_reported_issue, last_active FROM devices WHERE is_deleted = FALSE',
      };
      const result = await this._pool.query(query);
      return result.rows;
    }

    // Untuk user biasa, hanya akses device berdasarkan rental aktif miliknya
    const query = {
      text: `
        SELECT devices.id, devices.rental_id, devices.status, devices.last_reported_issue, devices.last_active
        FROM devices
        INNER JOIN rentals ON devices.rental_id = rentals.id
        WHERE rentals.user_id = $1 AND rentals.rental_status = 'active' AND devices.is_deleted = FALSE
      `,
      values: [userId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getDevice(userId, role, deviceId) {
    // Jika role adalah admin, user dapat mengakses detail semua device
    if (role === 'admin') {
      const query = {
        text: 'SELECT * FROM devices WHERE id = $1 AND is_deleted = FALSE',
        values: [deviceId],
      };
      const result = await this._pool.query(query);
      if (!result.rowCount) {
        throw new NotFoundError('Device tidak ditemukan');
      }
      return result.rows[0];
    }

    // Untuk user biasa, validasi kepemilikan device
    const query = {
      text: `
        SELECT devices.* 
        FROM devices
        INNER JOIN rentals ON devices.rental_id = rentals.id
        WHERE devices.id = $1 AND rentals.user_id = $2 AND rentals.rental_status = 'active' AND devices.is_deleted = FALSE
      `,
      values: [deviceId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Device tidak ditemukan');
    }
    return result.rows[0];
  }

  async deviceControl(userId, role, { id, action }) {
    const status = action === 'on' ? 'active' : 'inactive';

    // Jika role adalah admin, user dapat mengontrol semua device
    if (role === 'admin') {
      const query = {
        text: 'UPDATE devices SET status = $1 WHERE id = $2 AND is_deleted = FALSE RETURNING id, status',
        values: [status, id],
      };
      const result = await this._pool.query(query);
      if (!result.rowCount) {
        throw new NotFoundError('Device tidak ditemukan');
      }
      return result.rows[0];
    }

    // Untuk user biasa, validasi kepemilikan device
    const query = {
      text: `
        UPDATE devices 
        SET status = $1 
        WHERE id = $2 
        AND rental_id = (
          SELECT id FROM rentals WHERE user_id = $3 AND rental_status = 'active'
        ) 
        AND is_deleted = FALSE 
        RETURNING id, status
      `,
      values: [status, id, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Device tidak ditemukan atau Anda tidak memiliki akses');
    }
    return result.rows[0];
  }
}

export default DevicesService;
