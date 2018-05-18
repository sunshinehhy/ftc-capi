const moment = require('moment');

const mysqlDate = 'YYYY-MM-DD';
const mysqlDatetimte = 'YYYY-MM-DD HH:mm:ss';
const iso8601 = 'YYYY-DD-MMTHH:mm:ssZ';

/**
 * @description Format a Unix timestamp to ISO8601 format, with time zone set to China Standard Time.
 * @param {Number} seconds Unix timestamp in seconds
 */
exports.fromUnix = function(seconds) {
  // moment.unix(Number) returns an instance in local time, that is, the local time of the machine on which node is running.
  // Since we're not sure the time setting of servers, so we first set the moment instance to UTC time,
  // then move it to utc 8,
  // then format it in ISO8601
  return moment.unix(seconds).utc().utcOffset(8).format();
}

/**
 * @description Convert MySQL DATETIME to ISO8601 in UTC+8
 * @param {String} dt - 2017-11-09 17:40:36
 */
exports.fromDatetime = function(dt) {
  // First parse MySQL datatime string, then set timezone to +8, then format to ISO8601
  return moment.utc(dt, mysqlDatetimte).utcOffset(8).format();
}

/**
 * @description Current UTC+8 datetime in MySQL format
 */
exports.mysqlToday = function() {
  return moment.utc().utcOffset(8).format(mysqlDate);
}

/**
 * @description 7 days ago from now in UTC+8 in MySQL format
 * @param {Number} days 
 */
exports.mysqlDaysAgo = function(days=7) {
  return moment.utc().utcOffset(8).subtract(7, 'days').format(mysqlDate);
}