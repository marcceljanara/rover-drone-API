import AuthorizationError from '../exceptions/AuthorizationError.js';

const verifyAdmin = async (req, res, next) => {
  try {
    // Mengecek apakah role admin ada di dalam request
    if (!req.role) {
      throw new AuthorizationError('Role tidak ditemukan dalam token');
    }

    if (req.role !== 'admin') {
      throw new AuthorizationError('Anda tidak memiliki akses');
    }

    return next();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(403).json({
        status: 'fail',
        message: error.message,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export default verifyAdmin;
