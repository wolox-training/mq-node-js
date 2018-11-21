const User = require('../models').User,
  logger = require('../logger'),
  jwt = require('../services/jwt'),
  errors = require('../errors'),
  bcryptService = require('../services/bcrypt'),
  secret = require('../../config/index').common.session.secret,
  errorMessages = require('../errors').errorMessages;

exports.logIn = ({ user }, res, next) => {
  User.find({ where: { email: user.email } })
    .then(dbUser => {
      if (!dbUser) {
        throw errors.badRequest(errorMessages.nonExistingUser);
      } else {
        return bcryptService.isPasswordValid(user.password, dbUser).then(validPassword => {
          if (!validPassword) {
            throw errors.badRequest(errorMessages.invalidPassword);
          } else {
            const payload = { email: user.email };
            const token = jwt.encode(payload, secret);
            res
              .status(200)
              .json({ token })
              .end();
          }
        });
      }
    })
    .catch(next);
};

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
      if (isRegistered) throw errors.badRequest(errorMessages.emailIsAlreadyRegistered);
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

exports.listUsers = (req, res, next) => {
  try {
    jwt.decode(req.headers.token);
  } catch (e) {
    next(errors.badRequest(errorMessages.invalidToken));
    return;
  }

  req.query.page = Number.parseInt(req.query.page);
  if (!Number.isSafeInteger(req.query.page)) req.query.page = 0;

  req.query.limit = Number.parseInt(req.query.limit);
  if (!Number.isSafeInteger(req.query.limit)) req.query.limit = process.env.DEFAULT_ITEMS_PER_PAGE;
  return User.findAll({ limit: req.query.limit, offset: req.query.page * req.query.limit })
    .then(dbUsers => {
      const toSendUsers = dbUsers.map(u => {
        return { firstName: u.firstName, lastName: u.lastName, email: u.email };
      });

      return res
        .status(200)
        .send({ users: toSendUsers })
        .end();
    })
    .catch(e => next(errors.databaseError(errorMessages.databaseFailed)));
};

exports.getUserForToken = token => {
  try {
    const payload = jwt.decode(token);
    return User.find({ where: { email: payload.email } }).then(user => {
      if (!user) throw errors.internalServerError(errorMessages.tokenReferencesNonExistentUser);
      return user;
    });
  } catch (e) {
    throw errors.badRequest(errorMessages.invalidToken);
  }
};
