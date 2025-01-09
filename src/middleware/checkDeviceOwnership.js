/* eslint-disable consistent-return */
// BUAT KODE AUTHO MENGGUNAKAN MIDDLEWARE VERIFYTOKEN LALU
// AMBIL REQ.ID UNTUK PENGKONDISIAN IF REQ.ROLE = ADMIN
// MAKA TAMPILKAN SEMUA, JIKA REQ.ROLE = USER MAKA,
// TAMPILKAN SEMUA DATA TETAPI BERDASARKAN (WHERE) ID

// AUTHONYA BUAT DI HANDLER ATAU DI SERVICE

// IMPLEMENTASI MIDDLEWARE INI SETELAH FITUR RENTALS

import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool();

function checkDeviceOwnership(req, res, next) {
  const { id } = req.params; // ID perangkat yang diminta
  const { role } = req; // ID dan role dari token JWT
  const userId = req.id;

  // Jika user adalah admin, langsung pass ke middleware selanjutnya
  if (role === 'admin') {
    return next(); // Admin tidak perlu pengecekan lebih lanjut, langsung lanjutkan ke next
  }

  // Query untuk memeriksa apakah perangkat terkait dengan rental yang dimiliki oleh user
  const query = {
    text: 'SELECT d.id, r.user_id FROM devices d JOIN rentals r ON d.rental_id = r.id WHERE d.id = $1',
    values: [id],
  };

  // Menjalankan query
  pool.query(query)
    .then((result) => {
      if (result.rowCount === 0) {
        // Jika perangkat tidak ditemukan, kembalikan respons 404
        return res.status(404).json({ message: 'Device tidak ditemukan' });
      }

      const device = result.rows[0];

      // Periksa apakah user_id pada rental sesuai dengan userId yang ada di JWT
      if (device.user_id !== userId) {
        // Jika user tidak memiliki akses, kembalikan respons 403
        return res.status(403).json({ message: 'Anda tidak memiliki akses ke perangkat ini' });
      }

      // Jika user memiliki akses, lanjutkan ke handler berikutnya
      return next(); // Lanjutkan ke middleware selanjutnya
    })
    .catch((error) => {
      console.error(error);
      // Jika ada error di server, kembalikan respons 500
      return res.status(500).json({ message: 'Server error' });
    });
}

export default checkDeviceOwnership;
