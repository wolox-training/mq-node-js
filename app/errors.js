const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.DEFAULT_ERROR = 'default_error';
exports.DATABASE_ERROR = 'database_error';
exports.BAD_REQUEST = 'bad_request';
exports.BCRYPT_ERROR = 'bcrypt_error';
exports.INTERNAL_SERVER_ERROR = 'internal_server_error';
exports.RESOURCE_NOT_FOUND = 'resource_not_found';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);
exports.databaseError = message => internalError(message, exports.DATABASE_ERROR);
exports.badRequest = message => internalError(message, exports.BAD_REQUEST);
exports.bcryptError = message => internalError(message, exports.BCRYPT_ERROR);
exports.internalServerError = message => internalError(message, exports.INTERNAL_SERVER_ERROR);
exports.resourceNotFound = message => internalError(message, exports.RESOURCE_NOT_FOUND);

exports.errorMessages = {
  nonExistingUser: 'User does not exist',
  invalidPassword: 'Invalid password',
  invalidToken: 'Invalid Token',
  emailIsAlreadyRegistered: 'email is already registered',
  tokenReferencesNonExistentUser: 'Token is referencing non-existing user',
  databaseFailed: 'Database failed',
  albumsNotAvailable: 'Albums not available',
  emailIsRequired: 'The email is required',
  emailMustBelongToWolox: 'Email must belong to wolox',
  textFieldIsRequired: field => `The ${field} field is required`,
  textFieldMustBeString: field => `The ${field} field must be string`,
  textFieldCantBeEmpty: field => `The ${field} cant be empty`,
  passwordMustBeAtLeast8CharsLong: 'Password must be at least 8 characters long',
  passwordMustBeAlphanumeric: 'Password must be alphanumeric',
  passwordIsRequired: 'The password is required',
  tokenIsRequired: 'Token is required',
  tokenCantBeEmpty: 'Token cant be empty',
  bcryptHashFailed: 'Bcrypt password hash failed',
  bcryptCompareFailed: 'Bcrypt password hash compare failed'
};
