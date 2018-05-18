const sql = require('../util/sql-trim.js');
const columns = require('../util/columns');
const formatTime = require('../util/format-time');

const utc8Now = 'DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR)';

class Staff {
  /**
   * @param {mysql2.PromisePool} pool - instance of mysql2 connection pool
   */
  constructor(pool) {
    this.pool = pool
  }

  async createTable() {
    const query = sql`
    CREATE TABLE IF NOT EXISTS backyard.staff (
      PRIMARY KEY (id),
      id          INT NOT NULL AUTO_INCREMENT,
      username    VARCHAR(20) NOT NULL,
                  UNIQUE INDEX (username),
      email       VARCHAR(80),
                  UNIQUE INDEX (email),
      password    BINARY(16) NOT NULL,
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      display_name VARCHAR(20),
                  UNIQUE INDEX (display_name),
      groups      VARCHAR(20) NOT NULL DEFAULT 'editor',
      department  VARCHAR(80),
      vip_status  ENUM('not-applied', 'pending', 'granted', 'rejected', 'revoked') NOT NULL DEFAULT 'not-applied',
      created_utc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_utc DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      last_login_ip VARBINARY(16),
      group_memberships INT NOT NULL DEFAULT 8,
      myft_email  VARCHAR(50),
                  UNIQUE INDEX (myft_email)
    )`

    const [res, ] = await this.pool.execute(query);

    return res;
  }
  /**
   * @param {Object} values
   * @param {String} values.name
   * @param {string} values.email
   * @param {String} values.password
   * @param {string?} values.displayName
   * @param {string?} values.department
   * 
   */
  async create(values) {
    const query = sql`
    INSERT INTO backyard.staff
      SET username = :name,
        email = :email,
        password = UNHEX(MD5(:password)),
        display_name = :displayName,
        department = :department,
        created_utc = UTC_TIMESTAMP()
    ON DUPLICATE KEY UPDATE 
      is_active = 1,
      vip_status = 'not-applied',
      myft_email = NULL`;

    const [res, ] = await this.pool.execute(query, values);

    return {
      insertId: res.insertId
    };
  }

  /**
   * @description User authentiacion with username and password
   * @typedef {Object} CMSAccount
   * @property {number} userId
   * @property {string} userName
   * @property {string} displayName
   * @param {Object} credentials
   * @param {String} credentials.name
   * @param {String} credentials.password
   * @return {null | CMSAccount}
   */
  async auth(credentials) {
    const query = sql`
    SELECT id AS id,
      username AS name,
      display_name AS displayName
    FROM backyard.staff
    WHERE username = :name
      AND password = UNHEX(MD5(:password))
      AND is_active = 1`

    const [rows, ] = await this.pool.execute(query, credentials);

    return rows[0] ?
      rows[0] :
      null;
  }

  /**
   * @param {string} name
   * @param {String} ip
   */
  async updateLastLogin({ip, name}={}) {
    const query = sql`
    UPDATE backyard.staff
      SET lastlogin = UTC_TIMESTAMP(),
        last_login_ip = INET6_ATON(:ip)
    WHERE username = :name
    LIMIT 1`

    const [results, ] = await this.pool.execute(query, {ip, name});

    return {
      affectedRows: results.affectedRows,
      changedRows: results.changedRows
    };
  }

  /**
   * @description Retrieve a staff's information by either id or username
   * @param {string} column - one of the values defined in columns.
   * @param {Object} value
   * @param {number} value.userId
   * @param {string} value.userName
   * @return {null | Object}
   */
  async retrieve(column, value) {
    let columnName;

    switch (column) {
      case columns.userName:
        columnName = 'username';
        break;

      case columns.id:
        columnName = 'id';
        break;

      default:
        throw new Error(`Query condition must be 'userName' or 'id'`);
    }

    const query = sql`
    SELECT id,
      username AS name,
      email AS email,
      display_name AS displayName,
      vip_status AS vipStatus,
      created_utc AS createdAt,
      last_login_utc AS lastLoginAt,
      INET6_NTOA(last_login_ip) AS lastLoginIP,
      myft_email AS myftEmail
    FROM backyard.staff
    WHERE ${columnName} = :value
      AND is_active = 1
    LIMIT 1`

    const [rows, ] = await this.pool.execute(query, {value});

    if (!rows[0]) {
      return null;
    }
    
    const info = rows[0];

    info.createdAt = formatTime.fromDatetime(info.createdAt);
    info.lastLoginAt = formatTime.fromDatetime(info.lastLoginAt);

    return info;
  }

  async retrieveAll() {
    const query = sql`
    SELECT id,
      username AS userName,
      email,
      is_active AS isActive,
      display_name AS displayName,
      vip_status AS vipApplication,
      myft_email AS myftEmail
    FROM backyard.staff
    ORDER BY username`

    const [results, ] = await this.pool.execute(query);

    return results;
  }

  async updatePassword({userId, password}={}) {
    const query = sql`
    UPDATE backyard.staff
      SET password = UNHEX(MD5(:password))
    WHERE id = :userId`

    const [res, ] = await this.pool.execute(query, {userId, password});

    return writeResult(res);
  }

  async update(values) {
    
  }

  /**
   * @description When deactivating a cms account, you should also set userinfo.isvip = false
   * @param {string} userId
   */
  async deactivate(userId) {
    // First unset isvip of the myft email associated with this cms account;
    // Then unset this cms account.
    const query1 = sql`
    UPDATE cmstmp01.userinfo
      SET isvip = 0
    WHERE email = (
      SELECT myft_email
      FROM backyard.staff
      WHERE id = :userId
      LIMIT 1
    )
    LIMIT 1`

    const query2 = sql`
    UPDATE backyard.staff
      SET is_active = 0,
        vip_status = 'not-applied',
        myft_email = NULL
    WHERE id = :userId
    LIMIT 1`;

    const conn = await this.pool.getConnection();
    await conn.beginTransaction();

    const [r1, ] = await this.pool.execute(query1, {userId});
    console.log('Unset vip result: %o', r1);

    const [r2, ] = await this.pool.execute(query2, {userId});
    console.log('Deactivate account result: %o', r2);

    await conn.commit();

    conn.release();

    return writeResult(r2);
  }

  /**
   * @description Check if email + password exsits.
   * @typedef {Object} FTCAccount
   * @property {string} email
   * @property {boolean} isVIP
   * 
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @return {null | FTCAccount}
   */
  async authMyft(credentials) {
    const query = sql`
    SELECT email AS myftEmail,
      isvip AS isVIP
    FROM cmstmp01.userinfo
    WHERE (email, password) = (:email, MD5(:password))`;

    const [rows, ] = await this.pool.execute(query, credentials);

    return rows[0] ? rows[0] : null;
  }

  /**
   * @description Bind myft email to CMS account. This is used for initial application or after user changed bound account.
   * @param {Object} values
   * @param {string} values.myftEmail
   * @param {string} values.userId
   * @param {boolean} values.isVIP - Returned by authMyft
   * myft_email is uniqued constrained, it might throw duplicate error. The error look like:
   Error {
    code: 'ER_DUP_ENTRY',
    errno: 1062,
    message: "Duplicate entry 'neefrankie@gmail.com' for key 'myft_email'",
    sqlMessage: "Duplicate entry 'neefrankie@gmail.com' for key 'myft_email'",
    sqlState: '23000',
  }
   */
  async bindMyft(values) {
    const query = sql`
    UPDATE backyard.staff
      SET myft_email = :myftEmail,
        vip_status = IF(:isVIP, 'granted', 'not-applied')
    WHERE id = :userId
    LIMIT 1`;

    const [results, ] = await this.pool.execute(query, values)

    return writeResult(results);
  }

  /**
   * @description Check if user has myft account set
   * @param {string} userId 
   */
  async hasMyft(userId) {
    const query = sql`
    SELECT myft_email AS myftEmail
    FROM backyard.staff
    WHERE id = :userId
    LIMIT 1`;

    const [res, ] = await this.pool.execute(query, {userId});

    return res[0] ?
      res[0] :
      null;
  }

  /**
   * @description User initiated application for VIP.
   * @param {string} userId
   * @return {Object | false}
   */
  async applyForVIP(userId) {
    /**
     * @type {{myftEmail: string | null}}
     */
    const bound = await this.hasMyft(userId);
    console.log(bound);

    if (!bound || !bound.myftEmail) {
      return false;
    }

    const query = sql`
    UPDATE backyard.staff
      SET vip_status = 'pending'
    WHERE id = :userId
    LIMIT 1`;

    const [res, ] = await this.pool.execute(query, {userId});

    return writeResult(res);
  }
  /**
   * @description Simutaneously set userinfo.isvip = true and staff.vip_status = granted
   * @param {string} userId 
   */
  async grantVIP(userId) {
    const query1 = sql`
    UPDATE backyard.staff
      SET vip_status = 'granted'
    WHERE id = :userId
    LIMIT 1`;

    const query2 = sql`
    UPDATE cmstmp01.userinfo
      SET isvip = 1
    WHERE email = (
      SELECT myft_email
      FROM backyard.staff
      WHERE id = :userId
      LIMIT 1
    )
    LIMIT 1`;

    const conn = await this.pool.getConnection();
    await conn.beginTransaction();

    const [r1, ] = await this.pool.execute(query1, {userId});
    console.log('Grant result: %o', r1);

    const [r2, ] = await this.pool.execute(query2, {userId});
    console.log('Set vip result: %o', r2);

    await conn.commit();

    conn.release();

    return writeResult(r2);
  }

  /**
   * @description 
   * @param {string} userId 
   */
  async rejectVIP(userId) {
    const query = sql`
    UPDATE backyard.staff
      SET vip_status = 'rejected'
    WHERE id = :userId
    LIMIT 1`

    const [result, ] = await this.pool.execute(query, {userId});

    return writeResult(result);
  }
  /**
   * @description 
   * @param {string} userId 
   */
  async revokeVIP(userId) {
    const query1 = sql`
    UPDATE backyard.staff
      SET vip_status = 'revoked'
    WHERE id = :userId
    LIMIT 1`;

    const query2 = sql`
    UPDATE cmstmp01.userinfo
      SET isvip = 0
    WHERE email = (
      SELECT myft_email
      FROM backyard.staff
      WHERE id = :userId
      LIMIT 1
    )
    LIMIT 1`

    const conn = await this.pool.getConnection();
    await conn.beginTransaction();
  
    const [r1, ] = await this.pool.execute(query1, {userId});
    console.log('Revoke result: %o', r1);
  
    const [r2, ] = await this.pool.execute(query2, {userId});
    console.log('Unset vip result: %o', r2);
  
    await conn.commit();
  
    conn.release();
  
    return writeResult(r2);
  }
}

function writeResult(r) {
  return {
    affectedRows: r.affectedRows,
    changedRows: r.changedRows
  };
}

module.exports = Staff