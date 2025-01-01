import pkg from 'pg';
import { nanoid } from 'nanoid';
import NotFoundError from '../../exceptions/NotFoundError.js';

const { Pool } = pkg;

class DevicesService {
  constructor() {
    this._pool = new Pool();
  }

  async addDevice() {
    const id = `device-${nanoid(16)}`;
    const mqttControlTopic = `control/${nanoid(12)}`;
    const mqttSensorTopic = `sensor/${nanoid(12)}`;
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
      text: 'DELETE FROM devices WHERE id = $1 RETURNING id',
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
      text: 'UPDATE devices SET status = $1 WHERE id = $2 RETURNING id',
      values: [status, id],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }

  async changeMqttSensor(id) {
    const mqttSensorTopic = `sensor/${nanoid(12)}`;
    const query = {
      text: 'UPDATE devices SET sensor_topic = $1 WHERE id = $2 RETURNING id',
      values: [mqttSensorTopic, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }

  async changeMqttControl(id) {
    const mqttControlTopic = `control/${nanoid(12)}`;
    const query = {
      text: 'UPDATE devices SET control_topic = $1 WHERE id = $2 RETURNING id',
      values: [mqttControlTopic, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }

  async addRentalId(id, rentalId) {
    const query = {
      text: 'UPDATE devices SET rental_id = $1 WHERE id = $2 RETURNING id',
      values: [rentalId, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }

  async deleteRentalId(id) {
    const query = {
      text: 'UPDATE devices SET rental_id = NULL WHERE rental_id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Perangkat dengan rental_id tersebut tidak ditemukan');
    }

    return result.rows[0]; // Mengembalikan ID perangkat yang diupdate
  }

  async getAllDevice() {
    const query = {
      text: 'SELECT id, rental_id, status, last_reported_issue, last_active FROM devices',
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getDevice(id) {
    const query = {
      text: 'SELECT * FROM devices WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }

  async deviceControl({ id, action }) {
    const status = action === 'on' ? 'active' : 'inactive';
    const query = {
      text: 'UPDATE devices SET status = $1 WHERE id = $2 RETURNING id, status',
      values: [status, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('device tidak ditemukan');
    }
    return result.rows[0];
  }
}

export default DevicesService;
