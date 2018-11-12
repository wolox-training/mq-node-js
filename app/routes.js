const userController = require('./controllers/user'),
  {
    validateEmail,
    validateFirstName,
    validateLastName,
    validateSignUp,
    validatePassword,
    validateEmailIsNotRegistered
  } = require('./middlewares/user');

exports.init = app => {
  app.post(
    '/users',
    [
      validateFirstName,
      validateLastName,
      validateEmail,
      validateEmailIsNotRegistered,
      validatePassword,
      validateSignUp
    ],
    userController.signUp
  );
};
