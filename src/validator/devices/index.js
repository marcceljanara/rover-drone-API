import InvariantError from '../../exceptions/InvariantError.js';
import {
  putRentalIdPayloadSchema,
  paramsPayloadSchema,
  putDeviceControlPayloadSchema,
  putStatusDevicePayloadSchema,
  querySensorPayloadSchema,
  queryLimitPayloadSchema,
  querySensorDownloadPayloadSchema,
} from './schema.cjs';

const DevicesValidator = {
  validateParamsPayload: (payload) => {
    const validationResult = paramsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutRentalIdPayload: (payload) => {
    const validationResult = putRentalIdPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutDeviceControlPayload: (payload) => {
    const validationResult = putDeviceControlPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutStatusDevicePayload: (payload) => {
    const validationResult = putStatusDevicePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateQuerySensorPayload: (payload) => {
    const validationResult = querySensorPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateQueryLimitPayload: (payload) => {
    const validationResult = queryLimitPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateQuerySensorDownloadPayload: (payload) => {
    const validationResult = querySensorDownloadPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default DevicesValidator;
