const log = require('../util/logger');
const sql = require('../util/sql-trim.js');
const columns = require('../util/columns');
const timeFormatter = require('../util/format-time');

const TIME_LAYOUT = '%Y-%m-%dT%H:%i:%S+08:00';

class FTCUser {
  /**
   * @param {mysql2.PromisePool} pool - instance of mysql2 connection pool
   */
  constructor(pool) {
    this.pool = pool
  }

  async search(column, value) {
    let columnName;

    switch (column) {
      case columns.name:
        columnName = 'user_name'
        break;

      case columns.email:
        columnName = 'email'
        break;

      default:
        throw new Error(`Query condition is not specified: name or email.`);
    }

    const query = sql`
    SELECT user_id AS id,
      user_name AS name,
      email
    FROM cmstmp01.userinfo
    WHERE ${columnName} = :value
    LIMIT 1`

    const [rows, ] = await this.pool.execute(query, {value});

    return rows[0]
      ? rows[0]
      : null;
  }

  /**
   * @param {String} userId - uuid
   */
  async retrieve(userId) {
    const query = sql`
    SELECT user_id AS id,
      user_name AS name,
      email,
      CASE title
        WHEN '101' THEN 'M'
        WHEN '102' THEN 'F'
      END AS gender,
      last_name AS familyName,
      first_name AS givenName,
      phone_no AS phoneNumber,
      mobile_phone_no AS mobileNumber,
      birthdate AS birthdate,
      address AS address,
      zip AS zipCode,
      DATE_FORMAT(register_time, '${TIME_LAYOUT}') AS createdAt,
      DATE_FORMAT(last_modified, '${TIME_LAYOUT}') AS updatedAt,
      DATE_FORMAT(last_login, '${TIME_LAYOUT}') AS lastLoginAt
    FROM cmstmp01.userinfo
    WHERE user_id = :userId
    LIMIT 1`

    log.info(userId);
    log.info(query);

    const [rows, ] = await this.pool.execute(query, {userId});

    return rows[0]
      ? rows[0]
      : null;
  }

  async newsletter(userId) {
    const query = sql`
    SELECT mail_sub_todayStory AS todayFocus,
      mail_sub_fridayStory AS weeklyChoice,
      mail_sub_pmStory AS afternoonExpress
    FROM cmstmp01.userinfo
    WHERE user_id = :userId
    LIMIT 1`

    const [rows, ] = await this.pool.execute(query, {userId});

    return rows[0]
      ? toBoolean(rows[0])
      : null;
  }

  /**
   * 
   * @param {String} start - the minimum date
   * @param {String} end - the maxmum date. If omitted, if should be DATE(NOW())
   */
  async dailySignup(start, end) {
    const query = sql`
    SELECT COUNT(*) AS userCount,
      DATE(register_time) AS recordDate
    FROM cmstmp01.userinfo
    WHERE DATE(register_time) BETWEEN DATE(:start) AND DATE(:end)
    GROUP BY DATE(register_time)
    ORDER BY DATE(register_time) DESC;`;

    const [rows, ] = await this.pool.execute(query, {start, end});

    return rows;
  }
}

function toBoolean(obj) {
  const o = {};
  for ([k, v] of Object.entries(obj)) {
    switch (v) {
      case 'true':
        o[k] = true;
        break;

      case 0:
      case -0:
      case null:
      case false:
      case NaN:
      case undefined:
      case '':
      case 'false':
        o[k] = false;
        break;

      default:
        o[k] = Boolean(v);
    }
  }
  return o;
}

module.exports = FTCUser;