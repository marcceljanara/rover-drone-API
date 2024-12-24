import InvariantError from '../../../exceptions/InvariantError.js';
import AdminsValidator from '../index.js';

describe('Admins Schema', () => {
  describe('Post Register User by Admin Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      // Arrange
      const payload = {
        username: 'marcceljanara',
        password: 'superpassword',
        fullname: 'Marccel Janara',
      };

      // Actions and assert
      expect(() => AdminsValidator
        .validatePostRegisterUserByAdminPayload(payload)).toThrowError(InvariantError);
    });
    it('should throw error when payload did not meet data type specification', () => {
      // Arrange
      const payload = {
        username: 'marcceljanara',
        password: 'superpassword',
        fullname: 'Marccel Janara',
        email: 123,
      };

      // Action and assert
      expect(() => AdminsValidator
        .validatePostRegisterUserByAdminPayload(payload)).toThrowError(InvariantError);
    });
    it('should throw error when username contains more than 50 character', () => {
      // Arrange
      const payload = {
        username: 'marcceljanarasahasfhsafsalffffffffffffffffffffffffffffff',
        password: 'superpassword',
        fullname: 'Marccel Janara',
        email: 'kucing@gmail.com',
      };

      // Actions and assert
      expect(() => AdminsValidator
        .validatePostRegisterUserByAdminPayload(payload)).toThrowError(InvariantError);
    });
    it('should throw error when email not valid', () => {
      // Arrange
      const payload = {
        username: 'marcceljanara',
        password: 'superpassword',
        fullname: 'Marccel Janara',
        email: 'kucinggmail.com',
      };

      // Actions and assert
      expect(() => AdminsValidator
        .validatePostRegisterUserByAdminPayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because pass validation', () => {
      // Arrange
      const payload = {
        username: 'marcceljanara',
        password: 'superpassword',
        fullname: 'Marccel Janara',
        email: 'kucing@gmail.com',
      };

      // Actions and assert
      expect(() => AdminsValidator
        .validatePostRegisterUserByAdminPayload(payload)).not.toThrowError();
    });
  });
  describe('Params Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      // Arrange
      const payload = {

      };
      // Action and Assert
      expect(() => AdminsValidator.validateParamsPayload(payload)).toThrowError(InvariantError);
    });
    it('should throw error when payload did not meet data type specification', () => {
      // Arrange
      const payload = {
        id: 123,
      };
      // Action and Assert
      expect(() => AdminsValidator.validateParamsPayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because pass validation', () => {
      // Arrange
      const payload = {
        id: 'user-123',
      };
      // Action and assert
      expect(() => AdminsValidator.validateParamsPayload(payload)).not.toThrowError(InvariantError);
    });
  });
  describe('Query Payload', () => {
    it('should throw error when payload did not meet data type specification', () => {
      // Arrange
      const payload = {
        limit: 'a',
        page: 1,
        search: 'user-123',
      };
      // Action and assert
      expect(() => AdminsValidator.validateQueryPayload(payload)).toThrowError(InvariantError);
    });
    it('should not throw error when payload is empty', () => {
      // Arrange
      const payload = {

      };

      // Action and asset
      expect(() => AdminsValidator.validateQueryPayload(payload)).not.toThrowError();
    });
    it('should pass validation when payload meet all data criteria', () => {
      // Arrange
      const payload = {
        limit: 10,
        page: 1,
        search: 'user-123',
      };

      // Action and assert
      expect(() => AdminsValidator.validateQueryPayload(payload)).not.toThrowError();
    });
  });
  describe('Password User Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      // Arrange
      const payload = {
        newPassword: 'superpassword',
      };

      // Action and Assert
      expect(() => AdminsValidator
        .validatePutPasswordUserPayload(payload)).toThrowError(InvariantError);
    });
    it('should throw error when payload did not meet data type specification', () => {
      // Arrange
      const payload = {
        newPassword: 123,
        confNewPassword: 'superpassword',
      };

      // Action and assert
      expect(() => AdminsValidator
        .validatePutPasswordUserPayload(payload)).toThrowError(InvariantError);
    });
    it('should not throw error because pass validation', () => {
      // Arrange
      const payload = {
        newPassword: 'superpassword',
        confNewPassword: 'superpassword',
      };

      // Action and assert
      expect(() => AdminsValidator.validatePutPasswordUserPayload(payload)).not.toThrowError();
    });
  });
});
