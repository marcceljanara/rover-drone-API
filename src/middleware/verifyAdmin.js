import AuthorizationError from '../exceptions/AuthorizationError.js';

const verifyAdmin = async (req, res, next) => {
  try {
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

    // Penanganan error tak terduga
    console.error(error); // Log error untuk debugging
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export default verifyAdmin;
