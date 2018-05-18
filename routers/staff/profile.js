const columns = require('../../util/columns');
const errors = require('../../util/errors');
const {staff} = require('../../models');

exports.show = async function (ctx, next) {
  const staffId = ctx.params.id;

  const profile = await staff.retrieve(columns.id, staffId);

  if (!profile) {
    throw new errors.ErrNotFound();
  }

  ctx.body = profile;
};

exports.update = async function (ctx, next) {

};

exports.updatePassword = async function (ctx) {
  /**
   * @type {{userId: string, password: string}}
   */
  const credentials = ctx.request.body;

  const res = await staff.updatePassword(credentials);

  ctx.status = 204;
}