const jwtsimple = require('jwt-simple'),
  secret = require('../../config/index').common.session.secret,
  User = require('../models').User,
  errors = require('../errors'),
  userIds2validTokens = {},
  errorMessages = errors.errorMessages,
  config = require('../../config');

const tokenIsValid = (user, token) =>
  userIds2validTokens[user.id] && userIds2validTokens[user.id].includes(token);

exports.generateTokenForUser = dbUser => {
  const payload = { email: dbUser.email, timestamp: Date.now() };
  const token = jwtsimple.encode(payload, secret);
  if (!userIds2validTokens[dbUser.id]) userIds2validTokens[dbUser.id] = [token];
  else userIds2validTokens[dbUser.id].push(token);
  return token;
};

exports.decode = token => jwtsimple.decode(token, secret);

exports.getUserForToken = token => {
  try {
    const { email, timestamp } = exports.decode(token);
    return User.findUser(email).then(user => {
      const deltaMs = Date.now() - timestamp;
      const sessionDurationMs = config.common.api.userSessionDurationInSeconds
        ? Number.parseInt(config.common.api.userSessionDurationInSeconds) * 1000
        : 30 * 60 * 1000; // default value in case env is not set up correctly
      if (deltaMs > sessionDurationMs || !tokenIsValid(user, token))
        throw errors.authenticationError('Token expired');
      else return user;
    });
  } catch (e) {
    throw errors.authenticationError(errorMessages.invalidToken);
  }
};

exports.invalidateAllTokensForUser = user => {
  userIds2validTokens[user.id] = [];
};
