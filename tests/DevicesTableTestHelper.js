/* istanbul ignore file */
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool();

const DevicesTableTestHelper = {
  async findDeviceById(id) {
    const query = {
      text: 'SELECT * FROM devices WHERE id = $1 AND is_deleted = FALSE',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM devices WHERE 1=1');
  },
};

export default DevicesTableTestHelper;
