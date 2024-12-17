const Joi = require('joi');

const UserSchema = {
  userPayload: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    fullname: Joi.string().required(),
    email: Joi.string().email().required(),
  }),

  otpPayload: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  }),

  resendOtpPayload: Joi.object({
    email: Joi.string().email().required(),
  }),
};

module.exports = UserSchema;
