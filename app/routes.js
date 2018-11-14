const userController = require('./controllers/user'),
  {
    validateEmail,
    validateLogin,
    validatePassword,
    validateFirstName,
    validateLastName,
    validateSignUp,
    validatePage,
    validateToken,
    validateErrors
  } = require('./middlewares/user');

exports.init = app => {
  app.post(
    '/users',
    [validateFirstName, validateLastName, validateEmail, validatePassword, validateSignUp],
    userController.signUp
  );

  app.post('/users/sessions', [validateEmail, validatePassword, validateLogin], userController.logIn);

  app.get('/users', [validatePage, validateToken, validateErrors], userController.listUsers);
};
