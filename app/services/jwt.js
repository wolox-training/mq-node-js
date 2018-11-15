const jwtsimple = require('jwt-simple'),
  secret = require('../../config/index').common.session.secret;

exports.encode = payload => jwtsimple.encode(payload, secret);
exports.decode = token => jwtsimple.decode(token, secret);
