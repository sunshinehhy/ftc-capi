const Router = require('koa-router');
const router = new Router();

router.get('/', async(ctx, next) => {
  console.log(ctx.protocol);
  const baseUrl = `${ctx.protocol}://${ctx.host}`;

  ctx.body = {
    article: `${baseUrl}/article`,
    ftcUser: `${baseUrl}/ftc-user`,
    staff: `${baseUrl}/staff`
  };
});

module.exports = router.routes();