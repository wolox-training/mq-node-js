const jwtsimple = require('jwt-simple'),
  secret = require('../../config/index').common.session.secret,
  User = require('../models').User,
  errors = require('../errors'),
  errorMessages = errors.errorMessages,
  config = require('../../config'),
  moment = require('moment'),
  sessionDurationMs = config.common.api.userSessionDurationInSeconds
    ? Number.parseInt(config.common.api.userSessionDurationInSeconds) * 1000
    : 30 * 60 * 1000; // default value in case env is not set up correctly;

exports.generateTokenForUser = user => {
  const now = moment();
  const token = jwtsimple.encode({ email: user.email, timestamp: now.format() }, secret);
  if (user.oldestTokenTimestamp) return Promise.resolve(token);
  return user.update({ oldestTokenTimestamp: now.format() }).then(() => token);
};

exports.decode = token => jwtsimple.decode(token, secret);

exports.getUserForToken = token => {
  let timestamp, email;

  try {
    const payload = exports.decode(token);
    timestamp = payload.timestamp;
    email = payload.email;
    if (!timestamp || !email) throw errors.authenticationError(errorMessages.invalidToken);
  } catch (e) {
    throw errors.authenticationError(errorMessages.invalidToken);
  }

  const momentInToken = moment(timestamp);

  return User.findUser(email).then(user => {
    const oldestTokenMoment = user.oldestTokenTimestamp ? moment(user.oldestTokenTimestamp) : null;

    if (
      !oldestTokenMoment ||
      oldestTokenMoment.diff(momentInToken) > 0 ||
      moment().diff(momentInToken) > sessionDurationMs
    )
      throw errors.authenticationError(errorMessages.tokenExpired);

    return user;
  });
};

exports.invalidateAllTokensForUser = user => user.update({ oldestTokenTimestamp: null });
