const jwtsimple = require('jwt-simple'),
  secret = require('../../config/index').common.session.secret,
  User = require('../models').User,
  errors = require('../errors'),
  ids2validTokens = {};

const tokenIsValid = (user, token) => ids2validTokens[user.id] && ids2validTokens[user.id].includes(token);

exports.generateTokenForUser = dbUser => {
  const payload = { email: dbUser.email, timestamp: Date.now() };
  const token = jwtsimple.encode(payload, secret);
  if (!ids2validTokens[dbUser.id]) ids2validTokens[dbUser.id] = [token];
  else ids2validTokens[dbUser.id].push(token);
  return token;
};

exports.decode = token => jwtsimple.decode(token, secret);

exports.getUserForToken = token => {
  try {
    const { email, timestamp } = exports.decode(token);
    return User.find({ where: { email } })
      .catch(e => {
        throw errors.databaseError(`Database failed${e.message}`);
      })
      .then(user => {
        if (!user) {
          // correctly decoded token belongs to no user, perhaps it was deleted without invalidating token?
          throw errors.internalServerError('User not found');
        } else {
          const deltaMs = Date.now() - timestamp;
          const sessionDurationMs = process.env.USER_SESSION_DURATION_IN_SECONDS
            ? Number.parseInt(process.env.USER_SESSION_DURATION_IN_SECONDS) * 1000
            : 30 * 60 * 1000; // default value in case env is not set up correctly
          if (deltaMs > sessionDurationMs || !tokenIsValid(user, token))
            throw errors.authenticationError('Token expired');
          else return user;
        }
      });
  } catch (e) {
    throw errors.authenticationError('Invalid Token');
  }
};

exports.invalidateAllTokensForUser = user => {
  ids2validTokens[user.id] = [];
};
