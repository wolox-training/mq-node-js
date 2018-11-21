const jwtsimple = require('jwt-simple'),
  secret = require('../../config/index').common.session.secret,
  User = require('../models').User,
  errors = require('../errors');

exports.encode = payload => jwtsimple.encode(payload, secret);
exports.decode = token => jwtsimple.decode(token, secret);

exports.getUserForToken = token => {
  try {
    const { email } = exports.decode(token);
    return User.find({ where: { email } });
  } catch (e) {
    throw errors.badRequest('Invalid Token');
  }
};
