const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
    "connectionLimit": 10,
    "host":  isProduction ? '172.27.10.241' : '127.0.0.1',
    "user": isProduction ? 'ftnew' : "sampadm",
    "password": isProduction ? 'ftftft.' : "secret",
    "dateStrings": true,
    "namedPlaceholders": true,
    "timezone": "Z"
}