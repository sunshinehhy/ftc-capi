exports.ErrUnauthorized = class extends Error {
  constructor() {
    super('Requires authentication');
    this.status = 401
  }
}

exports.ErrBadRequest = class extends Error {
  constructor(msg) {
    super(msg);
    this.status = 400;
  }
}

exports.ErrNotFound = class extends Error {
  constructor() {
    super('Not found');
    this.status = 404;
  }
}

exports.ErrUnprocessable = class extends Error {
  constructor(msg, details) {
    super(msg);
    this.status = 422;
    if (details) {
      this.errors = details;
    }
  }
}

exports.isDupEntry = function(err) {
  if (err.code === 'ER_DUP_ENTRY' && err.errno === 1062) {
    return true;
  }
  return false;
}