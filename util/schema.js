const Joi = require('joi');

exports.login = Joi.object().keys({
  name: Joi.string().trim().min(1).max(30).required(),
  password: Joi.string().trim().required(),
  ip: Joi.string().trim()
});