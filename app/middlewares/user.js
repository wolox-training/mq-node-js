const { body, header, validationResult } = require('express-validator/check'),
  errors = require('../errors'),
  jwt = require('../services/jwt'),
  errorMessages = require('../errors').errorMessages;

const emailBelongsToWolox = email => {
  // checks if email is valid and if it's domain belongs to wolox.
  // regex exp replaces all characters up-to and including the last '@' with empty: ''
  // so: some@email@wolox.com.ar => wolox.com.ar
  return email.replace(/.*@/, '') === 'wolox.com.ar';
};

exports.validateEmail = body('email')
  .isEmail()
  .withMessage(errorMessages.emailIsRequired)
  .normalizeEmail()
  .custom(email => emailBelongsToWolox(email))
  .withMessage(errorMessages.emailMustBelongToWolox);

const validateTextField = field =>
  body(field)
    .exists()
    .withMessage(errorMessages.textFieldIsRequired(field))
    .isString()
    .withMessage(errorMessages.textFieldMustBeString(field))
    .not()
    .isEmpty()
    .withMessage(errorMessages.textFieldCantBeEmpty(field));

exports.validateFirstName = validateTextField('firstName');
exports.validateLastName = validateTextField('lastName');

exports.validatePassword = body('password')
  .exists()
  .withMessage(errorMessages.passwordIsRequired)
  .isLength({ min: 8 })
  .withMessage(errorMessages.passwordMustBeAtLeast8CharsLong)
  .matches(/\d/)
  .withMessage(errorMessages.passwordMustBeAlphanumeric);

exports.validateErrors = (req, res, next) => {
  const validationErrors = validationResult(req)
    .array()
    .map(e => e.msg);
  if (validationErrors.length === 0) next();
  else {
    throw errors.badRequest(validationErrors);
  }
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  req.user = { email, password };
  exports.validateErrors(req, res, next);
};

exports.validateSignUp = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  req.user = { firstName, lastName, email, password };
  exports.validateErrors(req, res, next);
};

exports.validateToken = header('token')
  .exists()
  .withMessage(errorMessages.tokenIsRequired)
  .not()
  .isEmpty()
  .withMessage(errorMessages.tokenCantBeEmpty);

exports.validateTokenCanBeDecoded = (req, res, next) => {
  try {
    jwt.decode(req.headers.token);
    next();
  } catch (e) {
    console.log(`\n\n\n${'holis'}\n\n\n`);
    next(errors.badRequest(errorMessages.invalidToken));
  }
};

exports.validateToken = header('token')
  .exists()
  .withMessage(errorMessages.tokenIsRequired)
  .not()
  .isEmpty()
  .withMessage(errorMessages.tokenCantBeEmpty);
