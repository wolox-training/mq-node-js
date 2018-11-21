const jwtsimple = require('jwt-simple'),
  secret = require('../../config/index').common.session.secret,
  User = require('../models').User,
  errors = require('../errors'),
  errorMessages = errors.errorMessages,
  config = require('../../config');

exports.encode = payload => jwtsimple.encode(payload, secret);
exports.decode = token => jwtsimple.decode(token, secret);

exports.getUserForToken = token => {
  try {
    const { email, timestamp } = exports.decode(token);

    return User.find({ where: { email } })
      .catch(e => {
        throw errors.databaseError(errorMessages.databaseFailed);
      })
      .then(user => {
        if (!user) {
          // correctly decoded token belongs to no user, perhaps it was deleted without invalidating token?
          throw errors.internalServerError(errorMessages.userNotFound);
        } else {
          const deltaMs = Date.now() - timestamp;
          const sessionDurationMs = config.common.api.userSessionDurationInSeconds
            ? Number.parseInt(config.common.api.userSessionDurationInSeconds) * 1000
            : 30 * 60 * 1000; // default value in case env is not set up correctly
          if (deltaMs > sessionDurationMs) throw errors.authenticationError(errorMessages.tokenExpired);
          else return user;
        }
      });
  } catch (e) {
    throw errors.authenticationError(errorMessages.invalidToken);
  }
};
