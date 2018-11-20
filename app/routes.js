const userController = require('./controllers/user'),
  {
    validateEmail,
    validateLogin,
    validatePassword,
    validateFirstName,
    validateLastName,
    validateSignUp,
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
  app.get('/users', [validateToken, validateErrors], userController.listUsers);
  app.post(
    '/admin/users',
    [validateToken, validateFirstName, validateLastName, validateEmail, validatePassword, validateSignUp],
    userController.createAdmin
  );
};
