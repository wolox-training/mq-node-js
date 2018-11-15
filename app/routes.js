const userController = require('./controllers/user'),
  {
    validateEmail,
    validateLogin,
    validatePassword,
    validateFirstName,
    validateLastName,
    validateSignUp,
    validateToken
  } = require('./middlewares/user');

exports.init = app => {
  app.post(
    '/users',
    [validateFirstName, validateLastName, validateEmail, validatePassword, validateSignUp],
    userController.signUp
  );

  app.post('/users/sessions', [validateEmail, validatePassword, validateLogin], userController.logIn);
  app.post(
    '/admin/users',
    [validateToken, validateFirstName, validateLastName, validateEmail, validatePassword, validateSignUp],
    userController.createAdmin
  );
};
