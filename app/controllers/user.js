const User = require('../models').User,
  logger = require('../logger'),
  jwt = require('../services/jwt'),
  errors = require('../errors'),
  errorMessages = require('../errors').errorMessages,
  bcryptService = require('../services/bcrypt');

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

exports.invalidateAllTokens = (req, res, next) =>
  jwt
    .getUserForToken(req.headers.token)
    .then(user => jwt.invalidateAllTokensForUser(user))
    .then(() => res.status(200).end())
    .catch(next);

exports.listUsers = (req, res, next) => {
  req.query.page = Number.parseInt(req.query.page);
  if (!Number.isSafeInteger(req.query.page)) req.query.page = 0;

  req.query.limit = Number.parseInt(req.query.limit);
  if (!Number.isSafeInteger(req.query.limit)) req.query.limit = process.env.DEFAULT_ITEMS_PER_PAGE;
  return User.findAll({ limit: req.query.limit, offset: req.query.page * req.query.limit })
    .then(dbUsers => {
      const toSendUsers = dbUsers.map(u => ({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email
      }));

      return res
        .status(200)
        .send({ users: toSendUsers })
        .end();
    })
    .catch(e => next(errors.databaseError(errorMessages.databaseFailed)));
};
