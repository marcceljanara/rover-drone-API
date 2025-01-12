import InvariantError from '../../../exceptions/InvariantError.js';
import PaymentsValidator from '../index.js';

describe('PaymentsValidator', () => {
  describe('Params Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      const payload = {};

      expect(() => PaymentsValidator.validateParamsPayload(payload)).toThrowError(InvariantError);
    });

    it('should throw error when payload did not meet data type specification', () => {
      const payload = { id: 123 };

      expect(() => PaymentsValidator.validateParamsPayload(payload)).toThrowError(InvariantError);
    });

    it('should not throw error because payload meets validation criteria', () => {
      const payload = { id: 'payment-123' };

      expect(() => PaymentsValidator.validateParamsPayload(payload)).not.toThrowError();
    });
  });

  describe('Put Verification Payment Payload', () => {
    it('should throw error when payload did not contain needed property', () => {
      const payload = {};

      expect(() => PaymentsValidator.validatePutVerificationPaymentPayload(payload))
        .toThrowError(InvariantError);
    });

    it('should throw error when payload did not meet data type specification', () => {
      const payload = {
        paymentDate: 'invalid-date',
        paymentStatus: 'completed',
        paymentMethod: 12345,
        transactionDescription: null,
      };

      expect(() => PaymentsValidator.validatePutVerificationPaymentPayload(payload))
        .toThrowError(InvariantError);
    });

    it('should throw error when payload has invalid payment status', () => {
      const payload = {
        paymentDate: '2025-01-12T10:00:00Z',
        paymentStatus: 'pending',
        paymentMethod: 'credit card',
        transactionDescription: 'Test payment',
      };

      expect(() => PaymentsValidator.validatePutVerificationPaymentPayload(payload))
        .toThrowError(InvariantError);
    });

    it('should not throw error because payload meets validation criteria', () => {
      const payload = {
        paymentDate: '2025-01-12T10:00:00Z',
        paymentStatus: 'completed',
        paymentMethod: 'credit card',
        transactionDescription: 'Test payment',
      };

      expect(() => PaymentsValidator.validatePutVerificationPaymentPayload(payload))
        .not.toThrowError(InvariantError);
    });
  });
});
