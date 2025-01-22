/* eslint-disable import/no-extraneous-dependencies */
import pkg from 'pg';
import json2csv from 'json2csv';
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

  async getSensorData(userId, role, id, interval) {
    // Map interval ke durasi waktu dalam SQL
    const intervalMap = {
      '15m': '15 minutes',
      '1h': '1 hour',
      '6h': '6 hours',
      '12h': '12 hours',
      '24h': '1 day',
      '7d': '7 days',
      '30d': '30 days',
      '60d': '60 days',
      '90d': '90 days',
    };
    const sqlInterval = intervalMap[interval] || '1 hour'; // Default ke '1 hour'

    let query;

    if (role === 'admin') {
      // Query untuk admin: mengambil data sensor berdasarkan device_id
      query = {
        text: `
            SELECT * 
            FROM sensordata 
            WHERE device_id = $1 
              AND timestamp >= NOW() - INTERVAL '${sqlInterval}'
            ORDER BY timestamp DESC
          `,
        values: [id],
      };
    } else {
      // Query untuk user biasa: berdasarkan user_id, device_id, dan interval
      query = {
        text: `
            SELECT sd.* 
            FROM sensordata sd
            INNER JOIN devices d ON sd.device_id = d.id
            INNER JOIN rentals r ON d.rental_id = r.id
            WHERE r.user_id = $1 
              AND sd.device_id = $2 
              AND timestamp >= NOW() - INTERVAL '${sqlInterval}'
            ORDER BY sd.timestamp DESC
          `,
        values: [userId, id],
      };
    }

    // Eksekusi query
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Device tidak ditemukan');
    }

    // Return hasil
    return result.rows;
  }

  async getSensorDataLimit(userId, role, id, limit) {
    let query;

    if (role === 'admin') {
      // Query untuk admin: mengambil data sensor berdasarkan device_id
      query = {
        text: `
            SELECT * 
            FROM sensordata 
            WHERE device_id = $1 
            ORDER BY timestamp DESC 
            LIMIT $2
          `,
        values: [id, limit],
      };
    } else {
      // Query untuk user biasa: berdasarkan user_id, device_id, dan interval
      query = {
        text: `
            SELECT sd.* 
            FROM sensordata sd
            INNER JOIN devices d ON sd.device_id = d.id
            INNER JOIN rentals r ON d.rental_id = r.id
            WHERE r.user_id = $1 
              AND sd.device_id = $2 
            ORDER BY sd.timestamp DESC 
            LIMIT $3
          `,
        values: [userId, id, limit],
      };
    }

    // Eksekusi query
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Device tidak ditemukan');
    }

    // Return hasil
    return result.rows;
  }

  async getSensorDataDownload(userId, role, id, interval) {
    // Map interval ke durasi waktu dalam SQL
    const intervalMap = {
      '1h': '1 hour', // 1 jam terakhir
      '6h': '6 hours', // 6 jam terakhir
      '12h': '12 hours', // 12 jam terakhir
      '1d': '1 day', // 1 hari terakhir
      '7d': '7 days', // 7 hari terakhir
      '30d': '30 days', // 30 hari terakhir
      '60d': '60 days', // 2 bulan terakhir
      '90d': '90 days', // 3 bulan terakhir
      '180d': '180 days', // 6 bulan terakhir
      '365d': '365 days', // 1 tahun terakhir
    };

    const sqlInterval = intervalMap[interval] || '1 day'; // Default ke '1d'

    let query;
    if (role === 'admin') {
      // Query untuk admin: mengambil data berdasarkan device_id
      query = {
        text: `
          SELECT * 
          FROM sensordata 
          WHERE device_id = $1 
          AND timestamp >= NOW() - INTERVAL $2
          ORDER BY timestamp DESC
        `,
        values: [id, sqlInterval],
      };
    } else {
      // Query untuk user biasa: berdasarkan user_id, device_id, dan interval
      query = {
        text: `
          SELECT sd.* 
          FROM sensordata sd
          INNER JOIN devices d ON sd.device_id = d.id
          INNER JOIN rentals r ON d.rental_id = r.id
          WHERE r.user_id = $1 
          AND sd.device_id = $2 
          AND sd.timestamp >= NOW() - INTERVAL $3
          ORDER BY sd.timestamp DESC
        `,
        values: [userId, id, sqlInterval],
      };
    }
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Device tidak ditemukan');
    }
    const data = result.rows;

    // Konversi data ke CSV
    const csv = json2csv.parse(data);

    // Return CSV file content
    return csv;
  }
}

export default DevicesService;
