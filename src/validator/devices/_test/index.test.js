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
  describe('Query Sensor Payload', () => {
    it('should throw error when payload did not meet data type specification', () => {
      const payload = { interval: true };

      expect(() => DevicesValidator
        .validateQuerySensorPayload(payload)).toThrowError(InvariantError);
    });
    it('should throw error because payload not meets validation criteria', () => {
      const payload = { interval: '8h' };

      expect(() => DevicesValidator
        .validateQuerySensorPayload(payload)).toThrowError(InvariantError);
    });
    it('should not throw error because payload meets validation criteria', () => {
      const payload = { interval: '1h' };

      expect(() => DevicesValidator.validateQuerySensorPayload(payload)).not.toThrowError();
    });
  });
  describe('Query Sensor Download Payload', () => {
    it('should throw error when payload did not meet data type specification', () => {
      const payload = { interval: true };

      expect(() => DevicesValidator
        .validateQuerySensorDownloadPayload(payload)).toThrowError(InvariantError);
    });
    it('should throw error because payload not meets validation criteria', () => {
      const payload = { interval: '70d' };

      expect(() => DevicesValidator
        .validateQuerySensorDownloadPayload(payload)).toThrowError(InvariantError);
    });
    it('should not throw error because payload meets validation criteria', () => {
      const payload = { interval: '365d' };

      expect(() => DevicesValidator.validateQuerySensorDownloadPayload(payload)).not.toThrowError();
    });
  });
  describe('Query Limit Payload', () => {
    it('should throw error when payload did not meet data type specification', () => {
      const payload = { limit: true };

      expect(() => DevicesValidator
        .validateQueryLimitPayload(payload)).toThrowError(InvariantError);
    });
    it('should throw error because payload not meets validation criteria', () => {
      const payload = { limit: '200' };

      expect(() => DevicesValidator
        .validateQueryLimitPayload(payload)).toThrowError(InvariantError);
    });
    it('should not throw error because payload meets validation criteria', () => {
      const payload = { limit: '20' };

      expect(() => DevicesValidator.validateQueryLimitPayload(payload)).not.toThrowError();
    });
  });
});
