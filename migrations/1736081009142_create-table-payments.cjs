exports.shorthands = undefined;

exports.up = (pgm) => {
  // Membuat enum untuk payment_status
  pgm.createType('payment_status', ['pending', 'completed', 'failed']);

  // Membuat tabel payments
  pgm.createTable('payments', {
    id: {
      type: 'VARCHAR(24)',
      primaryKey: true,
    },
    rental_id: {
      type: 'VARCHAR(23)',
      notNull: true,
      references: '"rentals"', // Foreign key ke tabel rentals
      onDelete: 'CASCADE', // Jika rental dihapus, pembayaran terkait ikut dihapus
    },
    amount: {
      type: 'INTEGER',
      notNull: true,
    },
    payment_date: {
      type: 'DATE',
      notNull: false,
    },
    payment_status: {
      type: 'payment_status',
      notNull: true,
      default: 'pending', // Status default adalah 'pending'
    },
    payment_method: {
      type: 'VARCHAR(10)',
      notNull: false,
    },
    transaction_description: {
      type: 'TEXT',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  // Menghapus tabel payments dan enum payment_status
  pgm.dropTable('payments');
  pgm.dropType('payment_status');
};
