import jwt from 'jsonwebtoken'; // Untuk mocking jwt
import TokenManager from '../TokenManager'; // Ganti dengan path yang sesuai
import InvariantError from '../../exceptions/InvariantError';// Pastikan path benar

jest.mock('jsonwebtoken'); // Mock jsonwebtoken

describe('TokenManager', () => {
  describe('generateAccessToken', () => {
    it('should generate an access token correctly', () => {
      const payload = { id: 'user123', role: 'admin' };
      const fakeToken = 'fakeAccessToken';

      // Mock jwt.sign untuk mengembalikan fakeToken
      jwt.sign.mockReturnValue(fakeToken);

      const accessToken = TokenManager.generateAccessToken(payload);

      expect(accessToken)
        .toBe(fakeToken); // Verifikasi bahwa access token yang dikembalikan adalah token palsu
      expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token correctly', () => {
      const payload = { id: 'user123', role: 'admin' };
      const fakeToken = 'fakeRefreshToken';

      // Mock jwt.sign untuk mengembalikan fakeToken
      jwt.sign.mockReturnValue(fakeToken);

      const refreshToken = TokenManager.generateRefreshToken(payload);

      expect(refreshToken)
        .toBe(fakeToken); // Verifikasi bahwa refresh token yang dikembalikan adalah token palsu
      expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d' });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify the refresh token correctly and return the payload', () => {
      const refreshToken = 'validRefreshToken';
      const decodedPayload = { id: 'user123', role: 'admin' };

      // Mock jwt.verify untuk mengembalikan payload yang sudah didekodekan
      jwt.verify.mockReturnValue(decodedPayload);

      const payload = TokenManager.verifyRefreshToken(refreshToken);

      expect(payload)
        .toBe(decodedPayload); // Verifikasi payload yang dikembalikan sesuai dengan yang diharapkan
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.REFRESH_TOKEN_KEY);
    });

    it('should throw InvariantError when the refresh token is invalid', () => {
      const refreshToken = 'invalidRefreshToken';

      // Mock jwt.verify untuk melempar error
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => TokenManager.verifyRefreshToken(refreshToken))
        .toThrow(InvariantError); // Verifikasi bahwa error yang dilempar adalah InvariantError
      expect(() => TokenManager.verifyRefreshToken(refreshToken)).toThrow('Refresh token tidak valid'); // Verifikasi pesan error yang dilempar
    });
  });
});
