import jwt from 'jsonwebtoken';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token tidak ditemukan',
      });
    }

    // Verifikasi token
    const decoded = jwt.decode(token, process.env.ACCESS_TOKEN);

    req.id = decoded.id;
    req.role = decoded.role;
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token sudah kadaluarsa',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        status: 'fail',
        message: 'Token tidak valid',
      });
    }

    // Penanganan error tak terduga
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
  }
};

export default verifyToken;
