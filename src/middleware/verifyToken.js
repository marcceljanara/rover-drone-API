import jwt from 'jsonwebtoken';

// eslint-disable-next-line no-unused-vars
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'token tidak ditemukan',
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.id = decoded.id;
    req.role = decoded.role;
    return next();
  } catch (error) {
    return res.status(403).json({
      status: 'fail',
      message: 'token tidak valid',
    });
  }
};

export default verifyToken;
