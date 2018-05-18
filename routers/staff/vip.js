const Router = require('koa-router');
const debug = require('../../util/debug')('api:staff-vip');
const errors = require('../../util/errors');
const {staff} = require('../../models');

const router = new Router();

router.put('/apply/:id', async function(ctx) {
  const userId = ctx.params.id;

  const res = await staff.applyForVIP(userId);

  debug.info('VIP application result: %O', res);

  if (!res) {
    debug.info('No ftchinese.com account bound!');

    err = new errors.ErrUnprocessable('This account is not bound to any ftchinese.com account');
    err.error = {
      resource: 'VIP',
      field: 'email',
      code: 'missing'
    }
    throw err;
  }

  ctx.status = 201;
});

// grant, reject, revoke could only be used by administrators.
router.put('/grant/:id', async function(ctx) {
  const userId = ctx.params.id;

  const res = await staff.grantVIP(userId);

  ctx.status = 201;
});

router.put('/reject/:id', async function(ctx) {
  const userId = ctx.params.id;

  const res = await staff.rejectVIP(userId);

  ctx.status = 201;
});

router.put('/revoke/:id', async function (ctx) {
  const userId = ctx.params.id;

  const res = await staff.revokeVIP(userId);

  ctx.status = 201;
});

module.exports = router.routes();