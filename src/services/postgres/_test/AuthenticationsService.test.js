import pkg from 'pg';
import dotenv from 'dotenv';
import InvariantError from '../../../exceptions/InvariantError.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationTableHelper.js';
import AuthenticationsService from '../AuthenticationsService.js';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool();

describe('Authentication Service', () => {
  afterAll(async () => {
    await pool.end();
  });
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });
  describe('addRefreshToken function', () => {
    it('should add token to database', async () => {
      // Arrange
      const authenticationsService = new AuthenticationsService();
      const token = 'token';

      // Action
      await authenticationsService.addRefreshToken(token);
      // Assert

      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });
  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError if token not available', async () => {
      // Arrange
      const authenticationsService = new AuthenticationsService();
      const token = 'token';

      // Action and Assert
      await expect(authenticationsService.verifyRefreshToken(token))
        .rejects.toThrow(InvariantError);
    });

    it('should not throw InvariantError if token is available', async () => {
      // Arrange
      const authenticationsService = new AuthenticationsService();
      const token = 'token';
      await authenticationsService.addRefreshToken(token);

      // Action and Assert
      await expect(authenticationsService.verifyRefreshToken(token))
        .resolves.not.toThrow(InvariantError);
    });
  });
  describe('deleteRefreshToken function', () => {
    it('should delete token from database', async () => {
      // Arrange
      const authenticationsService = new AuthenticationsService();
      const token = 'token';
      await authenticationsService.addRefreshToken(token);

      // Actions
      await authenticationsService.deleteRefreshToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});
