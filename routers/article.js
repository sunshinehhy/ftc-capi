const Router = require('koa-router');
const router = new Router();
const errors = require('../util/errors');
const models = require('../models');

router.get('/', async (ctx, next) => {
  const baseUrl = `http://${ctx.host}${ctx.path}`;

  ctx.body = {
    oneArticle: `${baseUrl}/:articleId`
  }
});

router.get('/:articleId', async (ctx, next) => {
  const articleId = ctx.params.articleId;

  const article = await models.article.retrieve(articleId);

  if (!article) {
    throw new errors.ErrNotFound();
  }

  ctx.body = article;
});

module.exports = router.routes();