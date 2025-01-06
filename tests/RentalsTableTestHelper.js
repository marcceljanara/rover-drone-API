/* istanbul ignore file */
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool();

const RentalsTableTestHelper = {
  async findRentalById(id) {
    const query = {
      text: 'SELECT * FROM rentals WHERE id = $1 AND is_deleted = FALSE',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM rentals WHERE 1=1');
  },
};

export default RentalsTableTestHelper;
