import InvariantError from '../../../exceptions/InvariantError.js';
import AuthenticationsValidator from '../index.js';

describe('Authentication Schema', () => {
  describe('Post Authentication Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      // arrange
      const payload = {
        email: 'kucing@gmail.com',
      };

      // Actions and assert
      expect(() => AuthenticationsValidator
        .validatePostAuthenticationPayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when payload did not meet data type specification', () => {
      // Arrange
      const payload = {
        email: 'email@gmail.com',
        password: 123456,
      };

      // Actions and assert
      expect(() => AuthenticationsValidator
        .validatePostAuthenticationPayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when email not valid', () => {
      // Arrange
      const payload = {
        email: 'kucinggmail.com',
        password: 'superpassword',
      };

      // Actions and assert
      expect(() => AuthenticationsValidator
        .validatePostAuthenticationPayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because pass validation', () => {
      // Arrange
      const payload = {
        email: 'kucing@gmail.com',
        password: 'superpassword',
      };

      // Actions and assert
      expect(() => AuthenticationsValidator
        .validatePostAuthenticationPayload(payload)).not.toThrowError();
    });
  });
  describe('Put Authentication Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      // arrange
      const payload = {

      };

      // Actions and assert
      expect(() => AuthenticationsValidator
        .validatePutAuthenticationPayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when payload did not meet data type specification', () => {
      // Arrange
      const payload = {
        refreshToken: 1234567890,
      };

      // Actions and assert
      expect(() => AuthenticationsValidator
        .validatePutAuthenticationPayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because pass validation', () => {
      // Arrange
      const payload = {
        refreshToken: 'sadfjkdfhji1323jksd',
      };

      // Actions and assert
      expect(() => AuthenticationsValidator
        .validatePutAuthenticationPayload(payload)).not.toThrowError(InvariantError);
    });
  });
  describe('Delete Authentication Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      // arrange
      const payload = {

      };

      // Actions and assert
      expect(() => AuthenticationsValidator
        .validateDeleteAuthenticationPayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when payload did not meet data type specification', () => {
      // Arrange
      const payload = {
        refreshToken: 1234567890,
      };

      // Actions and assert
      expect(() => AuthenticationsValidator
        .validateDeleteAuthenticationPayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because pass validation', () => {
      // Arrange
      const payload = {
        refreshToken: 'dsfkjdskj234325skjdf',
      };

      // Actions and assert
      expect(() => AuthenticationsValidator.validateDeleteAuthenticationPayload(payload))
        .not.toThrowError(InvariantError);
    });
  });
});
