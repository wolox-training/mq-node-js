const userController = require('./controllers/user'),
  {
    validateEmail,
    validateLogin,
    validatePassword,
    validateEmailIsRegistered,
    validateFirstName,
    validateLastName,
    validateSignUp
  } = require('./middlewares/user');

exports.init = app => {
  app.post(
    '/users',
    [validateFirstName, validateLastName, validateEmail, validatePassword, validateSignUp],
    userController.signUp
  );
};
