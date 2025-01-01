import InvariantError from '../../../exceptions/InvariantError.js';
import DevicesValidator from '../index.js';

describe('DevicesValidator', () => {
  describe('Params Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      const payload = {};

      expect(() => DevicesValidator.validateParamsPayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when payload did not meet data type specification', () => {
      const payload = { id: 123 };

      expect(() => DevicesValidator.validateParamsPayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because payload meets validation criteria', () => {
      const payload = { id: 'device-123' };

      expect(() => DevicesValidator.validateParamsPayload(payload)).not.toThrowError();
    });
  });

  describe('Put Rental ID Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      const payload = {};

      expect(() => DevicesValidator
        .validatePutRentalIdPayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when payload did not meet data type specification', () => {
      const payload = { rental_id: 123 };

      expect(() => DevicesValidator
        .validatePutRentalIdPayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because payload meets validation criteria', () => {
      const payload = { rental_id: 'rental-456' };

      expect(() => DevicesValidator.validatePutRentalIdPayload(payload)).not.toThrowError();
    });
  });

  describe('Put Device Control Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      const payload = {};

      expect(() => DevicesValidator
        .validatePutDeviceControlPayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when payload did not meet data type specification', () => {
      const payload = { command: 123, action: 'invalid' };

      expect(() => DevicesValidator
        .validatePutDeviceControlPayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when action contains invalid value', () => {
      const payload = { command: 'restart', action: 'invalid' };

      expect(() => DevicesValidator
        .validatePutDeviceControlPayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because payload meets validation criteria', () => {
      const payload = { command: 'restart', action: 'on' };

      expect(() => DevicesValidator.validatePutDeviceControlPayload(payload)).not.toThrowError();
    });
  });

  describe('Put Status Device Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      const payload = {};

      expect(() => DevicesValidator
        .validatePutStatusDevicePayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when payload did not meet data type specification', () => {
      const payload = { status: 123 };

      expect(() => DevicesValidator
        .validatePutStatusDevicePayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when status contains invalid value', () => {
      const payload = { status: 'invalid' };

      expect(() => DevicesValidator
        .validatePutStatusDevicePayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because payload meets validation criteria', () => {
      const payload = { status: 'active' };

      expect(() => DevicesValidator.validatePutStatusDevicePayload(payload)).not.toThrowError();
    });
  });
});
