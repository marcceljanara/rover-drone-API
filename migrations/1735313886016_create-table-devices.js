exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('devices', {
    id: {
      type: 'VARCHAR(16)',
      notNull: true,
      primaryKey: true, // Menetapkan id sebagai primary key
    },
    rental_id: {
      type: 'VARCHAR(16)',
      references: '"rentals"', // Menunjukkan kolom rental_id adalah foreign key ke tabel rental
      onDelete: 'SET NULL', // Jika rental dihapus, rental_id di perangkat diset ke NULL
      default: null, // rental_id bisa bernilai NULL saat perangkat belum dialokasikan
    },
    status: {
      type: 'ENUM',
      values: ['active', 'inactive', 'maintenance', 'error'], // Status perangkat bisa aktif, tidak aktif, atau dalam perawatan
      notNull: true,
    },
    last_reported_issue: {
      type: 'DATE',
      default: null, // Tidak wajib diisi
    },
    last_active: {
      type: 'TIMESTAMP',
      notNull: false,
    },
    sensor_topic: {
      type: 'VARCHAR(255)',
      notNull: true, // Menyimpan topik untuk menerima data sensor
    },
    control_topic: {
      type: 'VARCHAR(255)',
      notNull: true, // Menyimpan topik untuk mengirimkan perintah kontrol
    },
    created_at: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'), // Menyimpan waktu pembuatan perangkat
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('devices'); // Menghapus tabel devices
};
