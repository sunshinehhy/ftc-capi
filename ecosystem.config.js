const path = require('path');
const interpreter = path.resolve(process.env.HOME, 'n/n/versions/node/9.9.0/bin/node');

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : "cms-api",
      script    : "./index.js",
      cwd: __dirname,
      interpreter: interpreter,
      env: {
        NODE_ENV: "development",
        PORT: 8100
      },
      env_production : {
        NODE_ENV: "production",
        PORT: 8100,
        LOG_DIR: path.resolve(process.env.HOME, 'logs')
      },
      max_restart: 10
    }
  ]
}
