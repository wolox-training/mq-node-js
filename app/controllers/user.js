const User = require('../models').User,
  logger = require('../logger'),
  jwt = require('jwt-simple'),
  errors = require('../errors'),
  bcryptService = require('../services/bcrypt'),
  secret = require('../../config/index').common.session.secret;

exports.signIn = ({ user }, res, next) => {
  const email = user.email;
  User.find({ where: { email } })
    .then(dbUser => {
      if (!dbUser) next(errors.badRequest('User does not exist'));
      bcryptService
        .isPasswordValid(user.password, dbUser)
        .then(validPassword => {
          if (!validPassword) next(errors.badRequest('Invalid password'));

          const payload = { email: user.email };
          const token = jwt.encode(payload, secret);
          res
            .status(200)
            .json({ token })
            .end();
        })
        .catch(e => next(errors.bcryptError('Password hash validation failed')));
    })
    .catch(e => next(errors.databaseError(e.message)));
};

const emailIsRegistered = email =>
  User.count({ where: { email } }).catch(e => {
    throw errors.databaseError(e.message);
  });

exports.signUp = ({ user }, res, next) =>
  emailIsRegistered(user.email)
    .then(isRegistered => {
      if (isRegistered) throw errors.badRequest('email is already registered');
      else
        return bcryptService.hashPassword(user.password).then(hashedPassword =>
          User.create({ ...user, password: hashedPassword }).then(newUser => {
            logger.info(`User ${newUser.lastName}, ${newUser.firstName} created successfuly`);
            res
              .status(201)
              .send(newUser)
              .end();
          })
        );
    })
    .catch(next);
