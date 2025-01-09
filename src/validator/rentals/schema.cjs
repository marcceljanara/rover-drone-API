const Joi = require('joi');

const paramsPayloadSchema = Joi.object({
  id: Joi.string().required(),
});

const putStatusRentalPayloadSchema = Joi.object({
  rentalStatus: Joi.string().valid('active', 'completed', 'cancelled').required(),
});

const postAddRentalPayloadSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
});

const putCancelRentalPayloadSchema = Joi.object({
  rentalStatus: Joi.string().valid('cancelled').required(),
});

module.exports = {
  paramsPayloadSchema,
  putStatusRentalPayloadSchema,
  postAddRentalPayloadSchema,
  putCancelRentalPayloadSchema,
};
