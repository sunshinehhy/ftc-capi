const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const log = require('./util/logger');

const app = new Koa();
const router = new Router();

const nav = require('./routers/nav');
const article = require('./routers/article');
const ftcUser = require('./routers/ftc-user');
const staff = require('./routers/staff');

app.proxy = true;

app.use(async function(ctx, next) {
  try {
    await next();
  } catch (e) {
    log.error(e);
    
    ctx.status = e.status || 500;
    ctx.body = {
      code: e.code,
      message: e.message,
      stack: e.stack
    };
  }
});

app.use(logger());
app.use(bodyParser());

router.use('/', nav);
router.use('/article', article);
router.use('/ftc-user', ftcUser);
router.use('/staff', staff);

app.use(router.routes());

/**
 * @param {Koa} app - a Koa instance
 */
async function bootUp(app) {
  const appName = 'cms-api';
  log.info(`Booting ${appName}`);

  const port = process.env.PORT || 8100;

  // Create HTTP server
  const server = app.listen(port);

  // Logging server error.
  server.on('error', (error) => {
    log.info(`Server error: %O`, error);
  });

  // Listening event handler
  server.on('listening', () => {
    log.info(`${appName} running on port ${server.address().port}`, );
  });
}

bootUp(app)
  .catch(err => {
    log.info('Bootup error: %O', err);
  });