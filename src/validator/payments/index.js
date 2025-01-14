import InvariantError from '../../exceptions/InvariantError.js';
import {
  paramsPayloadSchema,
  putVerificationPaymentPayloadSchema,
} from './schema.cjs';

const PaymentsValidator = {
  validateParamsPayload: (payload) => {
    const validationResult = paramsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutVerificationPaymentPayload: (payload) => {
    const validationResult = putVerificationPaymentPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default PaymentsValidator;
