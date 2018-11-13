const User = require('../models').User,
  logger = require('../logger'),
  errors = require('../errors'),
  bcryptService = require('../services/bcrypt');

const emailIsRegistered = email => {
  return User.count({ where: { email } }).catch(e => {
    throw errors.databaseError(e.message);
  });
};

exports.signUp = ({ user }, res, next) => {
  emailIsRegistered(user.email)
    .then(isRegistered => {
      if (isRegistered) next(errors.badRequest('email is already registered'));
      else
        return bcryptService.hashPassword(user.password).then(hashedPassword => {
          User.create({ ...user, password: hashedPassword }).then(newUser => {
            logger.info(`User ${newUser.lastName}, ${newUser.firstName} created successfuly`);
            res
              .status(201)
              .send(newUser)
              .end();
          });
        });
    })
    .catch(next);
};
