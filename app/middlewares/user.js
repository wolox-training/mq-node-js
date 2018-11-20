const { body, header, validationResult } = require('express-validator/check'),
  errors = require('../errors');

const errorMsgs = {
  emailIsRequired: 'The email is required',
  emailMustBelongToWolox: 'Email must belong to wolox',
  textFieldIsRequired: field => `The ${field} field is required`,
  textFieldMustBeString: field => `The ${field} field must be string`,
  textFieldCantBeEmpty: field => `The ${field} cant be empty`,
  passwordMustBeAtLeast8CharsLong: 'Password must be at least 8 characters long',
  passwordMustBeAlphanumeric: 'Password must be alphanumeric',
  passwordIsRequired: 'The password is required',
  tokenIsRequired: 'Token is required',
  tokenCantBeEmpty: 'Token cant be empty'
};

exports.validationErrorMessages = errorMsgs;

const emailBelongsToWolox = email => {
  // checks if email is valid and if it's domain belongs to wolox.
  // regex exp replaces all characters up-to and including the last '@' with empty: ''
  // so: some@email@wolox.com.ar => wolox.com.ar
  return email.replace(/.*@/, '') === 'wolox.com.ar';
};

exports.validateEmail = body('email')
  .isEmail()
  .withMessage(errorMsgs.emailIsRequired)
  .normalizeEmail()
  .custom(email => emailBelongsToWolox(email))
  .withMessage(errorMsgs.emailMustBelongToWolox);

const validateTextField = field =>
  body(field)
    .exists()
    .withMessage(errorMsgs.textFieldIsRequired(field))
    .isString()
    .withMessage(errorMsgs.textFieldMustBeString(field))
    .not()
    .isEmpty()
    .withMessage(errorMsgs.textFieldCantBeEmpty(field));

exports.validateFirstName = validateTextField('firstName');
exports.validateLastName = validateTextField('lastName');

exports.validatePassword = body('password')
  .exists()
  .withMessage(errorMsgs.passwordIsRequired)
  .isLength({ min: 8 })
  .withMessage(errorMsgs.passwordMustBeAtLeast8CharsLong)
  .matches(/\d/)
  .withMessage(errorMsgs.passwordMustBeAlphanumeric);

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

exports.validateToken = header('token')
  .exists()
  .withMessage(errorMsgs.tokenIsRequired)
  .not()
  .isEmpty()
  .withMessage(errorMsgs.tokenCantBeEmpty);
