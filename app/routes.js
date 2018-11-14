const userController = require('./controllers/user'),
  {
    validateEmail,
    validateFirstName,
    validateLastName,
    validateSignUp,
    validatePassword
  } = require('./middlewares/user');

exports.init = app => {
  app.post(
    '/users',
    [validateFirstName, validateLastName, validateEmail, validatePassword, validateSignUp],
    userController.signUp
  );
};
