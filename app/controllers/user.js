const User = require('../models').User,
  logger = require('../logger'),
  jwt = require('../services/jwt'),
  errors = require('../errors'),
  errorMessages = require('../errors').errorMessages,
  bcryptService = require('../services/bcrypt'),
  responsePaginationHelper = require('./responsePaginationHelper');

exports.logIn = ({ user }, res, next) =>
  User.find({ where: { email: user.email } })
    .then(dbUser => {
      if (!dbUser) {
        throw errors.badRequest(errorMessages.nonExistingUser);
      } else {
        return bcryptService.isPasswordValid(user.password, dbUser).then(validPassword => {
          if (!validPassword) {
            throw errors.badRequest(errorMessages.invalidPassword);
          } else {
            res
              .status(200)
              .send(jwt.generateTokenForUser(dbUser))
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
      if (isRegistered) throw errors.badRequest(errorMessages.emailIsAlreadyRegistered);
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
      if (!requestingUser.isAdmin) throw errors.badRequest(errorMessages.insufficientPermissions);

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

exports.listUsers = (req, res, next) =>
  User.findAllModels({
    limit: responsePaginationHelper.parsePageLimit(req.query),
    offset: responsePaginationHelper.parseOffset(req.query)
  })
    .then(dbUsers => {
      const toSendUsers = dbUsers.rows.map(u => ({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email
      }));

      return res
        .status(200)
        .send({ users: toSendUsers })
        .end();
    })
    .catch(next);
