import jwt from 'jsonwebtoken';
import InvariantError from '../exceptions/InvariantError';

const TokenManager = {
  generateAccessToken: (payload) => jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' }), // Sesuaikan expiresIn jika diperlukan

  generateRefreshToken: (payload) => jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d' }), // Sesuaikan expiresIn jika diperlukan

  verifyRefreshToken: (refreshToken) => {
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      return payload; // Mengembalikan payload yang didekodekan
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

export default TokenManager;
