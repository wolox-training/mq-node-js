const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DEFAULT_ERROR = 'default_error';
exports.DATABASE_ERROR = 'database_error';
exports.BAD_REQUEST = 'bad_request';
exports.BCRYPT_ERROR = 'bad_request';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);
exports.databaseError = message => internalError(message, exports.DATABASE_ERROR);
exports.badRequest = message => internalError(message, exports.BAD_REQUEST);
exports.bcryptError = message => internalError(message, exports.BCRYPT_ERROR);
