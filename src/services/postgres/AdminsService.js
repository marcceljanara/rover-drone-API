import pkg from 'pg';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';

const { Pool } = pkg;

class AdminsService {
  constructor() {
    this._pool = new Pool();
  }

  async registerUser({
    username, password, fullname, email,
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `user-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO users (id, username, password, fullname, email, is_verified) VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      valus: [id, username, hashedPassword, fullname, email, true],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal menambahkan user');
    }
    return result.rows[0].id;
  }

  async getAllUser(searchCondition, limit, offset) {
    const query = {
      text: `
          SELECT id, username, email, is_verified
          FROM users
          WHERE
            $1 = '' OR (
              username ILIKE $1 OR
              email ILIKE $1 OR
              id ILIKE $1
            )
          ORDER BY username ASC
          LIMIT $2 OFFSET $3;
        `,
      values: [searchCondition, limit, offset],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getCountData(searchCondition) {
    const query = {
      text: `
          SELECT COUNT(*) AS total_count
          FROM users
          WHERE
            $1 = '' OR (
              username ILIKE $1 OR
              email ILIKE $1 OR
              id ILIKE $1
            );
        `,
      values: [searchCondition],
    };
    const result = await this._pool.query(query);
    return parseInt(result.rows[0].total_count, 10);
  }

  async getDetailUser(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('user tidak ditemukan');
    }
    return result.rows[0];
  }

  async checkIsAdmin(id) {
    const query = {
      text: 'SELECT role FROM users WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw AuthorizationError('anda tidak berhak mengakses admin lain');
    }
  }

  async deleteUser(id) {
    const query = {
      text: 'DELETE FROM users WHERE id = $1',
      values: [id],
    };
    await this._pool.query(query);
  }
}

export default AdminsService;
