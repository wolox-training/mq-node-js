const User = require('../models').User,
  logger = require('../logger'),
  errors = require('../errors'),
  bcryptService = require('../services/bcrypt');

exports.signUp = ({ user }, res, next) => {
  bcryptService
    .hashPassword(user.password)
    .then(hashed => {
      user.password = hashed;
      return User.create(user)
        .then(dbUser => {
          logger.info(`User ${dbUser.lastName}, ${dbUser.firstName} created successfuly`);
          res
            .status(201)
            .send(dbUser)
            .end();
        })
        .catch(e => next(e));
    })
    .catch(e => next(errors.bcryptError('Password encryption failed')));
};
