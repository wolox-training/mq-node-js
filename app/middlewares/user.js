const { body, check, validationResult } = require('express-validator/check'),
  User = require('../models').User,
  logger = require('../logger'),
  errors = require('../errors');

const emailBelongsToWolox = email => {
  // checks if email is valid and if it's domain belongs to wolox.
  // regex exp replaces all characters up-to and including the last '@' with empty: ''
  // so: some@email@wolox.com.ar => wolox.com.ar
  return email.replace(/.*@/, '') === 'wolox.com.ar';
};

exports.validateEmail = body('email')
  .isEmail()
  .withMessage('The email is required')
  .normalizeEmail()
  .custom(email => emailBelongsToWolox(email))
  .withMessage('Email is required and must belong to wolox');

const validateTextField = field =>
  body(field)
    .exists()
    .withMessage(`The ${field} field is required`)
    .isString()
    .withMessage(`The ${field} field must be string`)
    .not()
    .isEmpty()
    .withMessage(`The ${field} field must not be empty`);

exports.validateFirstName = validateTextField('firstName');
exports.validateLastName = validateTextField('lastName');

exports.validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/\d/)
  .withMessage('Password must be alphanumeric');

const validateErrors = (req, res, next) => {
  const validationErrors = validationResult(req)
    .array()
    .map(e => e.msg);
  if (validationErrors.length === 0) next();
  else {
    next(errors.badRequest({ errors: validationErrors }));
  }
};

exports.validateSignUp = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  req.user = { firstName, lastName, email, password };
  validateErrors(req, res, next);
};
