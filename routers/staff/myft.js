const Joi = require('joi');
const debug = require('../../util/debug')('api:staff-myft');
const schema = require('../../util/schema');
const errors = require('../../util/errors');
const {staff} = require('../../models');

/**
 * 
 * @param {Router.IRouterContext} ctx 
 */
exports.bind = async function (ctx, next) {
  const userId = ctx.params.id;

  /**
   * @type {{email: string, password: string}}
   */
  const credentials = ctx.request.body;

  /**
   * @type {{ myftEmail: string, isVIP: boolean }}
   */
  const authRes = await staff.authMyft(credentials)

  if (!authRes) {
    throw new errors.ErrNotFound();
  }

  try {
    const res = await staff.bindMyft({
      myftEmail: authRes.myftEmail,
      isVIP: authRes.isVIP,
      userId,
    });

    debug.info('Bind myft account: %O', res);
  } catch (e) {
    if (errors.isDupEntry(e)) {
      throw new errors.ErrUnprocessable('The myft account you try to use is already taken', {
        resource: 'MyftAccount',
        field: 'email',
        code: 'already_exists'
      });
    }
    throw e;
  }

  ctx.status = 204;
}

