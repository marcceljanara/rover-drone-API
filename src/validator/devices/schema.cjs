const Joi = require('joi');

const paramsPayloadSchema = Joi.object({
  id: Joi.string().required(),
});

const putStatusDevicePayloadSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'maintenance', 'error').required(),
});

const putRentalIdPayloadSchema = Joi.object({
  rental_id: Joi.string().required(),
});

const putDeviceControlPayloadSchema = Joi.object({
  command: Joi.string().required(),
  action: Joi.string().valid('on', 'off').required(),
});

module.exports = {
  paramsPayloadSchema,
  putStatusDevicePayloadSchema,
  putRentalIdPayloadSchema,
  putDeviceControlPayloadSchema,
};
