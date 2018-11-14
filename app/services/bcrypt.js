const bcrypt = require('bcryptjs'),
  errors = require('../errors');

exports.hashPassword = password =>
  bcrypt.hash(password, bcrypt.genSaltSync(8)).catch(e => {
    throw errors.bcryptError('Bcrypt password hash failed');
  });

exports.isPasswordValid = (password, user) =>
  bcrypt.compare(password, user.password).catch(e => {
    throw errors.bcryptError('Bcrypt password hash compare failed');
  });
