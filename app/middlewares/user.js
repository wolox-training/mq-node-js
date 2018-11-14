const { body, check, validationResult } = require('express-validator/check'),
  User = require('../models').User,
  logger = require('../logger'),
  errors = require('../errors');

exports.validationErrorMessages = {
  emailIsRequired: 'The email is required',
  emailMustBelongToWolox: 'Email must belong to wolox',
  textFieldIsRequired: field => `The ${field} field is required`,
  textFieldMustBeString: field => `The ${field} field must be string`,
  textFieldCantBeEmpty: field => `The ${field} cant be empty`,
  passwordMustBeAtLeast8CharsLong: 'Password must be at least 8 characters long',
  passwordMustBeAlphanumeric: 'Password must be alphanumeric',
  passwordIsRequired: 'The password is required'
};

const emailBelongsToWolox = email => {
  // checks if email is valid and if it's domain belongs to wolox.
  // regex exp replaces all characters up-to and including the last '@' with empty: ''
  // so: some@email@wolox.com.ar => wolox.com.ar
  return email.replace(/.*@/, '') === 'wolox.com.ar';
};

exports.validateEmail = body('email')
  .isEmail()
  .withMessage(exports.validationErrorMessages.emailIsRequired)
  .normalizeEmail()
  .custom(email => emailBelongsToWolox(email))
  .withMessage(exports.validationErrorMessages.emailMustBelongToWolox);

const validateTextField = field =>
  body(field)
    .exists()
    .withMessage(exports.validationErrorMessages.textFieldIsRequired(field))
    .isString()
    .withMessage(exports.validationErrorMessages.textFieldMustBeString(field))
    .not()
    .isEmpty()
    .withMessage(exports.validationErrorMessages.textFieldCantBeEmpty(field));

exports.validateFirstName = validateTextField('firstName');
exports.validateLastName = validateTextField('lastName');

exports.validatePassword = body('password')
  .exists()
  .withMessage(exports.validationErrorMessages.passwordIsRequired)
  .isLength({ min: 8 })
  .withMessage(exports.validationErrorMessages.passwordMustBeAtLeast8CharsLong)
  .matches(/\d/)
  .withMessage(exports.validationErrorMessages.passwordMustBeAlphanumeric);

const validateErrors = (req, res, next) => {
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
  validateErrors(req, res, next);
};

exports.validateSignUp = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  req.user = { firstName, lastName, email, password };
  validateErrors(req, res, next);
};
