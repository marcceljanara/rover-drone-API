/* istanbul ignore file */
import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pkg;
const pool = new Pool();

const UsersTableTestHelper = {

  async addUser({
    id = 'user-123', username = 'marccel', email = 'email@gmail.com', fullname = 'Marccel Janara', password = 'superpassword', is_verified = true, otp_code = null, otp_expiry = null, role = 'user',
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, username, email, fullname, hashedPassword,
        is_verified, otp_code, otp_expiry, role],
    };
    const result = await pool.query(query);
    return result.rows[0].id;
  },

  async addAdmin({
    id = 'user-54321', username = 'adminkeren', email = 'admin@gmail.com', fullname = 'Admin Ganteng', password = 'superpassword', is_verified = true, otp_code = null, otp_expiry = null, role = 'admin',
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, username, email, fullname, hashedPassword,
        is_verified, otp_code, otp_expiry, role],
    };
    const result = await pool.query(query);
    return result.rows[0].id;
  },

  async findUsersById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM users WHERE 1=1');
  },
};

export default UsersTableTestHelper;
