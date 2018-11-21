const bcrypt = require('bcryptjs'),
  errors = require('../errors'),
  errorMessages = require('../errors').errorMessages;

exports.hashPassword = password =>
  bcrypt.hash(password, bcrypt.genSaltSync(8)).catch(e => {
    throw errors.bcryptError(errorMessages.bcryptHashFailed);
  });

exports.isPasswordValid = (password, user) =>
  bcrypt.compare(password, user.password).catch(e => {
    throw errors.bcryptError(errorMessages.bcryptCompareFailed);
  });
