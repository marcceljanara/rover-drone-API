/* eslint-disable import/no-extraneous-dependencies */
import cron from 'node-cron';
import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool();

// Jadwalkan tugas cron untuk membersihkan reservasi
// perangkat dan memperbarui status rental setiap detik
cron.schedule('* * * * * *', async () => {
  const client = await pool.connect();
  try {
    // Periksa perangkat yang reservasinya sudah kedaluwarsa dan bersihkan reservasinya
    const cleanDeviceQuery = {
      text: `
        UPDATE devices
        SET reserved_until = NULL
        WHERE reserved_until IS NOT NULL AND reserved_until < NOW()
      `,
    };
    const cleanDeviceResult = await client.query(cleanDeviceQuery);

    if (cleanDeviceResult.rowCount > 0) {
      console.log(`${cleanDeviceResult.rowCount} perangkat yang reservasinya kedaluwarsa telah dibersihkan.`);
    }

    // Periksa rental yang telah melewati TTL dan ubah status rental menjadi "cancelled"
    const cancelRentalQuery = {
      text: `
        UPDATE rentals
        SET rental_status = 'cancelled'
        WHERE rental_status = 'pending' AND NOW() > (reserved_until + INTERVAL '30 seconds')
      `,
    };
    const cancelRentalResult = await client.query(cancelRentalQuery);

    if (cancelRentalResult.rowCount > 0) {
      console.log(`${cancelRentalResult.rowCount} rental yang kedaluwarsa telah dibatalkan.`);
    }
  } catch (error) {
    //
  } finally {
    client.release(); // Selalu lepas koneksi
  }
});

console.log('Cron job untuk pembersihan reservasi perangkat dan pembatalan rental telah dimulai.');
