const {staff} = require('../../models');

exports.show = async (ctx, next) => {
  const list = await staff.retrieveAll();

  ctx.body = list;
}