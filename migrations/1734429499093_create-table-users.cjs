/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  // Membuat tipe ENUM untuk role
  pgm.createType('user_roles', ['admin', 'user']);

  // Membuat tabel users
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(22)',
      primaryKey: true,
    },
    username: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
    },
    email: {
      type: 'VARCHAR(255)',
      notNull: true,
      unique: true,
    },
    fullname: {
      type: 'TEXT',
      notNull: true,
    },
    password: {
      type: 'TEXT',
      notNull: true,
    },
    is_verified: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
    otp_code: {
      type: 'VARCHAR(6)',
      notNull: false,
    },
    otp_expiry: {
      type: 'TIMESTAMP',
      notNull: false,
    },
    role: {
      type: 'user_roles',
      notNull: true,
      default: 'user', // Default role adalah 'user'
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  // Menghapus tabel users
  pgm.dropTable('users');

  // Menghapus tipe ENUM user_roles
  pgm.dropType('user_roles');
};
