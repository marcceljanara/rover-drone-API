const Joi = require('joi');

const postRegisterUserByAdminPayloadSchema = Joi.object({
  username: Joi.string().max(50).required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
});

const paramsPayloadSchema = Joi.object({
  id: Joi.string().required(),
});

const queryPayloadSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100)
    .default(10),
  page: Joi.number().integer().min(1).default(1),
  search: Joi.string().allow('', null).default(''),
});

const putPasswordUserPayloadSchema = Joi.object({
  newPassword: Joi.string().required(),
  confNewPassword: Joi.string().required(),
});

module.exports = {
  postRegisterUserByAdminPayloadSchema,
  paramsPayloadSchema,
  queryPayloadSchema,
  putPasswordUserPayloadSchema,
};
