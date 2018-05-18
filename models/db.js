const mysql = require('mysql2/promise');
const config = require('./config.js');

class DB {
	constructor() {
		/**
		 * @type {mysql.PromisePool}
		 */
		this.pool = mysql.createPool(config);
	}
	
	/**
	 * @return {Promise<void>}
	 */
	end() {
		return this.pool.end()
	}
}

module.exports = DB;