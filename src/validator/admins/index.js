import InvariantError from '../../exceptions/InvariantError.js';
import {
  postRegisterUserByAdminPayloadSchema,
  paramsPayloadSchema,
  queryPayloadSchema,
  putPasswordUserPayloadSchema,
} from './schema.cjs';

const AdminsValidator = {
  validatePostRegisterUserByAdminPayload: (payload) => {
    const validationResult = postRegisterUserByAdminPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateParamsPayload: (payload) => {
    const validationResult = paramsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateQueryPayload: (payload) => {
    const validationResult = queryPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutPasswordUserPayload: (payload) => {
    const validationResult = putPasswordUserPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default AdminsValidator;
