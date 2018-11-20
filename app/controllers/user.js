const User = require('../models').User,
  logger = require('../logger'),
  jwt = require('../services/jwt'),
  errors = require('../errors'),
  bcryptService = require('../services/bcrypt');

const errorMsgs = {
  nonExistingUser: 'User does not exist',
  invalidPassword: 'Invalid password',
  emailIsAlreadyRegistered: 'email is already registered',
  insufficientPermissions: 'User is not authorized'
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
            const payload = { email: user.email, timestamp: Date.now() };
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

const createUser = (user, isAdmin = false) =>
  bcryptService
    .hashPassword(user.password)
    .then(hashedPassword => User.create({ ...user, password: hashedPassword, isAdmin }));

exports.signUp = ({ user }, res, next) =>
  emailIsRegistered(user.email)
    .then(isRegistered => {
      if (isRegistered) throw errors.badRequest(errorMsgs.emailIsAlreadyRegistered);
      else
        return createUser(user).then(newUser => {
          logger.info(`User ${newUser.lastName}, ${newUser.firstName} created successfuly`);
          res
            .status(201)
            .send(newUser)
            .end();
        });
    })
    .catch(next);

exports.createAdmin = (req, res, next) =>
  jwt
    .getUserForToken(req.headers.token)
    .then(requestingUser => {
      if (!requestingUser.isAdmin) throw errors.badRequest(errorMsgs.insufficientPermissions);

      return User.find({ where: { email: req.user.email } }).then(inDbUser => {
        if (inDbUser) {
          // inDbUser should be updated to be admin...
          return bcryptService.hashPassword(req.user.password).then(hashedPassword => {
            inDbUser
              .update({
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                password: hashedPassword,
                isAdmin: true
              })
              .then(updated =>
                res
                  .status(200)
                  .send(updated)
                  .end()
              );
          });
        } else {
          // user should be created from scratch but with admin privilges...
          return createUser(req.user, true).then(newUser => {
            logger.info(`User ${newUser.lastName}, ${newUser.firstName} created successfuly as admin`);
            res
              .status(201)
              .send(newUser)
              .end();
          });
        }
      });
    })
    .catch(next);
