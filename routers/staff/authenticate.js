const Joi = require('joi');
const debug = require('../../util/debug')('user:authenticate');
const schema = require('../../util/schema');
const errors = require('../../util/errors');
const {staff} = require('../../models');

exports.do = async (ctx, next) => {
  /**
   * @type {{name: string, password: string, ip: string}}
   */
  let credentials = ctx.request.body;
  try {
    credentials = await Joi.validate(credentials, schema.login);

  } catch (e) {
    throw e;
  }

  const account = await staff.auth(credentials);

  if (!account) {
    throw new errors.ErrUnauthorized();
  }

  ctx.body = account;

  staff.updateLastLogin({
    ip: credentials.ip,
    name: credentials.name
  })
  .catch(e => {
    debug.error(e);
  });
}