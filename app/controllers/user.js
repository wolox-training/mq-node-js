const User = require('../models').User,
  logger = require('../logger'),
  jwt = require('../services/jwt'),
  errors = require('../errors'),
  bcryptService = require('../services/bcrypt');

const errorMsgs = {
  nonExistingUser: 'User does not exist',
  invalidPassword: 'Invalid password',
  invalidToken: 'Invalid Token',
  emailIsAlreadyRegistered: 'email is already registered',
  insufficientPermissions: 'Insufficient Permissions'
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

const getUserForToken = token => {
  try {
    const decoded = jwt.decode(token);
    return User.find({ where: { email: decoded.email } });
  } catch (e) {
    throw errors.badRequest(errorMsgs.invalidToken);
  }
};

exports.createAdmin = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(requestingUser => {
      if (!requestingUser) {
        // correctly decoded token belongs to no user, perhaps it was deleted without invalidating token?
        throw errors.internalServerError();
      }

      if (!requestingUser.isAdmin) throw errors.badRequest(errorMsgs.insufficientPermissions);

      return User.find({ where: { email: req.user.email } }).then(inDbUser => {
        if (inDbUser) {
          // inDbUser should be updated to be admin...
          return bcryptService.hashPassword(req.user.password).then(hashedPassword => {
            inDbUser.firstName = req.user.firstName;
            inDbUser.lastName = req.user.lastName;
            inDbUser.password = hashedPassword;
            inDbUser.isAdmin = true;
            inDbUser.save().then(() => {
              res
                .status(200)
                .send(inDbUser)
                .end();
            });
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
