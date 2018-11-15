const User = require('../models').User,
  logger = require('../logger'),
  jwt = require('../services/jwt'),
  errors = require('../errors'),
  bcryptService = require('../services/bcrypt');

const errorMsgs = {
  nonExistingUser: 'User does not exist',
  invalidPassword: 'Invalid password',
  emailIsAlreadyRegistered: 'email is already registered'
};
exports.badRequestErrorMessages = errorMsgs;

exports.logIn = ({ user }, res, next) =>
  User.find({ where: { email: user.email } })
    .then(dbUser => {
      if (!dbUser) {
        throw errors.badRequest(errorMsgs.nonExistingUser);
      } else {
        return bcryptService.isPasswordValid(user.password, dbUser).then(validPassword => {
          if (!validPassword) {
            throw errors.badRequest(errorMsgs.invalidPassword);
          } else {
            const payload = { email: user.email };
            const token = jwt.encode(payload);
            res
              .status(200)
              .send(token)
              .end();
          }
        });
      }
    })
    .catch(next);

const emailIsRegistered = email =>
  User.count({ where: { email } }).catch(e => {
    throw errors.databaseError(e.message);
  });

exports.signUp = ({ user }, res, next) =>
  emailIsRegistered(user.email)
    .then(isRegistered => {
      if (isRegistered) throw errors.badRequest(errorMsgs.emailIsAlreadyRegistered);
      else
        return bcryptService.hashPassword(user.password).then(hashedPassword =>
          User.create({ ...user, password: hashedPassword, isAdmin: false }).then(newUser => {
            logger.info(`User ${newUser.lastName}, ${newUser.firstName} created successfuly`);
            res
              .status(201)
              .send(newUser)
              .end();
          })
        );
    })
    .catch(next);
