const FTCUser = require('./ftc-user');
const Staff = require('./staff');
const Article = require('./article');
const DB = require('./db');
const db = new DB();

exports.ftcUser = new FTCUser(db.pool);
exports.staff = new Staff(db.pool);
exports.article = new Article(db.pool);
