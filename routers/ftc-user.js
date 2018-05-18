const validator = require('validator');
const Router = require('koa-router');
const router = new Router();
const columns = require('../util/columns');
const {ftcUser} = require('../models');
const log = require('../util/logger');
const timeFormatter = require('../util/format-time');
const errors = require('../util/errors');

router.get('/', async (ctx, next) => {
  const baseUrl = `${ctx.protocol}://${ctx.host}${ctx.path}`;
  ctx.body = {
    search: `${baseUrl}/search?{email=<foo@bar.com>} | {name=username}`,
    invidual: `${baseUrl}/profile/:id`,
    newsletter: `${baseUrl}/newsletter/:id`,
    statistics: `${baseUrl}/stats`
  }
});

router.get('/search', async (ctx, next) => {
  const query = ctx.query;
  let column = '';
  let value = '';

  if (query.name) {
    column = columns.userName;
    value = query.name;
  }
  if (query.email) {
    column = columns.email;
    value = query.email;
  }

  if (!column && !value) {
    ctx.status = 400;
    ctx.body = {
      message: `Specify 'name' or 'email' to search`
    };
    return;
  }

  log.info(`FTCUser query: ${column}: ${value}`)
  const user = await ftcUser.search(column, value);

  log.info('Found user: ' + user);

  if (!user) {
    throw new errors.ErrNotFound();
  }

  ctx.body = user;
});

router.get('/profile/:id', async (ctx, next) => {
  const userId = ctx.params.id;
  log.info('User id: ' + userId);

  const profile = await ftcUser.retrieve(userId);

  log.info('User profile: ' + profile);

  if (!profile) {
    throw new errors.ErrNotFound();
  }

  ctx.body = profile;
});

router.get('/newsletter/:id', async(ctx, next) => {
  const userId = ctx.params.id;
  
  const subscribe = await ftcUser.newsletter(userId);

  if (!subscribe) {
    throw new errors.ErrNotFound();
  }

  ctx.body = subscribe;
});

router.get('/stats', async (ctx, next) => {
  const baseUrl = `${ctx.protocol}://${ctx.host}${ctx.path}`;
  ctx.body = {
    dailyNewUsers: `${baseUrl}/daily-new?{start=YYYY-MM-DD&end=YYYY-MM-DD}`
  }
});

router.get('/stats/daily-new', async(ctx, next) => {
  /**
   * @type {{start: string, end: string}}
   */
  const query = ctx.query;
  query.start = query.start
    ? validator.trim(query.start)
    : timeFormatter.mysqlDaysAgo();
  query.end = query.end
    ? validator.trim(query.end)
    : timeFormatter.mysqlToday()

  const isValid = validator.isISO8601(query.start) && validator.isISO8601(query.end);

  if (!isValid) {
    throw new errors.ErrBadRequest(`Query parameter 'start' or 'end' must be valid ISO8601 date: 'YYYY-MM-DD'`)
  }

  ctx.body = await ftcUser.dailySignup(query.start, query.end);
});

module.exports = router.routes();