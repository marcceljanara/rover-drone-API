import pkg from 'pg';
import { nanoid } from 'nanoid';
import NotFoundError from '../../exceptions/NotFoundError.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';
import InvariantError from '../../exceptions/InvariantError.js';

const { Pool } = pkg;

class RentalsService {
  constructor() {
    this._pool = new Pool();
  }

  async changeStatusRental(id, rentalStatus) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN'); // Mulai transaksi

      // Update status rental terlebih dahulu
      const updateRentalQuery = {
        text: 'UPDATE rentals SET rental_status = $1 WHERE id = $2 AND is_deleted = FALSE RETURNING id, rental_status',
        values: [rentalStatus, id],
      };
      const rentalResult = await client.query(updateRentalQuery);
      if (rentalResult.rowCount === 0) {
        throw new NotFoundError('rental tidak ditemukan');
      }

      // Jika status diubah menjadi 'active', perbarui rental_id pada devices
      if (rentalStatus === 'active') {
        const updateDeviceQuery = {
          text: `
            WITH cte AS (
              SELECT id
              FROM devices
              WHERE rental_id IS NULL AND is_deleted = FALSE
              LIMIT 1
            )
            UPDATE devices
            SET rental_id = $1
            FROM cte
            WHERE devices.id = cte.id AND is_deleted = FALSE
            RETURNING devices.id, devices.rental_id;
          `,
          values: [id],
        };
        const deviceResult = await client.query(updateDeviceQuery);

        if (deviceResult.rowCount === 0) {
          throw new NotFoundError('Tidak ada perangkat yang dapat dihubungkan dengan rental ini');
        }
      }

      // Jika status diubah menjadi 'completed', hapus rental_id pada devices
      if (rentalStatus === 'completed') {
        const updateDeviceQuery = {
          text: 'UPDATE devices SET rental_id = NULL WHERE rental_id = $1 AND is_deleted = FALSE',
          values: [id],
        };
        await client.query(updateDeviceQuery);
      }

      await client.query('COMMIT'); // Komit transaksi
      return rentalResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback transaksi jika terjadi kesalahan
      throw error;
    } finally {
      client.release(); // Lepaskan koneksi client
    }
  }

  async deleteRental(id) {
    const client = await this._pool.connect();
    try {
      await client.query('BEGIN'); // Mulai transaksi

      // Cek apakah rental_status masih "active"
      const checkRentalStatusQuery = {
        text: 'SELECT rental_status FROM rentals WHERE id = $1 AND is_deleted = FALSE',
        values: [id],
      };
      const rentalStatusResult = await client.query(checkRentalStatusQuery);
      if (rentalStatusResult.rowCount === 0) {
        throw new NotFoundError('Rental tidak ditemukan');
      }

      const rentalStatus = rentalStatusResult.rows[0].rental_status;
      if (rentalStatus === 'active') {
        throw new InvariantError('Tidak dapat menghapus rental dengan status active');
      }

      // Hapus rental jika status bukan 'active'
      const deleteRentalQuery = {
        text: 'UPDATE rentals SET is_deleted = TRUE WHERE id = $1 RETURNING id',
        values: [id],
      };
      const deleteResult = await client.query(deleteRentalQuery);

      await client.query('COMMIT'); // Komit transaksi
      return deleteResult.rows[0].id;
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback transaksi jika terjadi kesalahan
      throw error;
    } finally {
      client.release(); // Lepaskan koneksi client
    }
  }

  async addRental({ userId, startDate, endDate }, role) {
    const client = await this._pool.connect(); // Dapatkan client dari pool untuk transaksi
    try {
      const id = `rental-${nanoid(6)}`;
      const dailyRate = 100000;

      // Validasi tanggal
      const start_date = new Date(startDate);
      const end_date = new Date(endDate);
      const today = new Date();

      // Pastikan start_date dan end_date tidak kurang dari hari ini (hari ini masih valid)
      if (start_date < today || end_date < today) {
        throw new InvariantError('Tanggal mulai dan tanggal akhir tidak boleh kurang dari hari ini');
      }

      // Validasi bahwa start_date maksimal 3 hari setelah hari ini
      const maxStartDate = new Date(today);
      maxStartDate.setDate(today.getDate() + 3); // +3 hari

      if (start_date > maxStartDate) {
        throw new InvariantError('Tanggal mulai tidak boleh lebih dari 3 hari setelah hari ini');
      }

      if (end_date < start_date) {
        throw new InvariantError('tanggal akhir harus lebih besar atau sama dengan tanggal mulai');
      }

      // Validasi role
      if (role === 'admin') {
        throw new AuthorizationError('admin tidak bisa melakukan aksi mengajukan rental');
      }

      // Hitung durasi rental dalam hari
      const rentalDays = Math.ceil((end_date - start_date) / (1000 * 60 * 60 * 24)) + 1;

      // Hitung total biaya
      const cost = rentalDays * dailyRate;

      await client.query('BEGIN'); // Mulai transaksi

      // Cek apakah ada perangkat yang tersedia (rental_id IS NULL atau reserved_until sudah habis)
      const availableDeviceQuery = {
        text: `
          SELECT id FROM devices
          WHERE (rental_id IS NULL AND is_deleted = FALSE) 
            AND (reserved_until IS NULL OR reserved_until < NOW())
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        `,
      };
      const availableDeviceResult = await client.query(availableDeviceQuery);

      if (availableDeviceResult.rowCount === 0) {
        throw new NotFoundError('Tidak ada perangkat yang tersedia untuk disewakan');
      }

      const deviceId = availableDeviceResult.rows[0].id;

      // Reservasi perangkat dengan TTL 30 detik
      const reserveDeviceQuery = {
        text: `
          UPDATE devices
          SET reserved_until = NOW() + INTERVAL '30 seconds'
          WHERE id = $1
        `,
        values: [deviceId],
      };
      await client.query(reserveDeviceQuery);

      // Tambahkan rental
      const rentalQuery = {
        text: 'INSERT INTO rentals (id, user_id, start_date, end_date, cost, reserved_until) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL \'30 seconds\') RETURNING id, cost',
        values: [id, userId, start_date, end_date, cost],
      };
      const rentalResult = await client.query(rentalQuery);

      // Tambahkan pembayaran terkait rental
      const paymentId = `payment-${nanoid(16)}`;
      const paymentQuery = {
        text: 'INSERT INTO payments (id, rental_id, amount) VALUES ($1, $2, $3)',
        values: [paymentId, rentalResult.rows[0].id, cost],
      };
      await client.query(paymentQuery);

      await client.query('COMMIT'); // Commit transaksi jika semuanya sukses
      rentalResult.rows[0].payment_id = paymentId;
      return rentalResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback jika ada kesalahan
      throw error;
    } finally {
      client.release(); // Selalu release client ke pool
    }
  }

  async getAllRental(role, userId) {
    if (role === 'admin') {
      const query = {
        text: `SELECT id, 
        start_date, 
        end_date, 
        rental_status, 
        cost FROM rentals WHERE is_deleted = FALSE`,
        values: [],
      };
      const result = await this._pool.query(query);
      return result.rows;
    }
    const query = {
      text: `SELECT id, 
      start_date, 
      end_date, 
      rental_status, 
      cost FROM rentals WHERE user_id = $1 AND is_deleted = FALSE`,
      values: [userId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getDetailRental(id, role, userId) {
    if (role === 'admin') {
      const query = {
        text: `SELECT *, 
        reserved_until AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS reserved_until,
        created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS created_at,
        updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS updated_at
        FROM rentals WHERE id = $1 AND is_deleted = FALSE`,
        values: [id],
      };
      const result = await this._pool.query(query);
      if (!result.rowCount) {
        throw new NotFoundError('rental tidak ditemukan');
      }
      return result.rows[0];
    }
    const query = {
      text: `SELECT *,
      reserved_until AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS reserved_until,
      created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS created_at,
      updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS updated_at
      FROM rentals WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
      values: [id, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('rental tidak ditemukan');
    }
    return result.rows[0];
  }

  async cancelRental({ userId, id, rentalStatus }, role) {
    if (role === 'admin') {
      throw new AuthorizationError('admin tidak bisa membatalkan pengajuan rental');
    }
    const query = {
      text: 'UPDATE rentals SET rental_status = $1 WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE RETURNING rental_status, id',
      values: [rentalStatus, id, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('rental tidak ditemukan');
    }
    return result.rows[0];
  }
}

export default RentalsService;
