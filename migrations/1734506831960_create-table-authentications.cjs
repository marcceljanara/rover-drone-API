exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('authentications', {
    token: {
      type: 'TEXT',
      notNull: true,
      unique: true, // Token harus unik untuk menghindari duplikasi
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    expires_at: {
      type: 'TIMESTAMP',
      notNull: true, // Menambahkan waktu kedaluwarsa untuk token
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('authentications');
};
