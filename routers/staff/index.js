const Router = require('koa-router');

const authenticate = require('./authenticate');
const roster = require('./roster');
const profile = require('./profile');
const myft = require('./myft');
const vip = require('./vip');

const router = new Router();

/**
 * @description Discovery
 */
router.get('/', async (ctx) => {
  const baseUrl = `${ctx.protocol}://${ctx.host}${ctx.path}`;
  ctx.body = {
    authentication: `${baseUrl}/auth`,
    roster: `${baseUrl}/roster`,
    individual: `${baseUrl}/profile/:id`,
    bindMyft: `${baseUrl}/myft/:id`,
    applyVIP: `${baseUrl}/vip/apply/:id`,
    grantVIP: `${baseUrl}/vip/grant/:id`,
    rejectVIP: `${baseUrl}/vip/reject/:id`,
    revokeVIP: `${baseUrl}/vip/revoke/:id`
  };
});

router.post('/auth', authenticate.do);

router.post('/new', async (ctx, next) => {

});

// All emloyees
router.get('/roster', roster.show);

// Individual profile
router.get('/profile/:id', profile.show);

router.post('/profile/password', profile.updatePassword);

// Bind cms account with myft account
router.post('/myft/:id', myft.bind);

// Apply for vip
router.use('/vip', vip);

module.exports = router.routes();