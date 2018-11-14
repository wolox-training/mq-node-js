const jwt = require('jwt-simple'),
  secret = require('../../config/index').common.session.secret;

exports.encode = payload => jwt.encode(payload, secret);
exports.decode = token => jwt.decode(token, secret);
