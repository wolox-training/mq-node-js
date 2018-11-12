const userController = require('./controllers/user'),
  {
    validateEmail,
    validateLogin,
    validatePassword,
    validateEmailIsRegistered
  } = require('./middlewares/user');

exports.init = app => {
  app.post(
    '/users/sessions',
    [validateEmail, validatePassword, validateEmailIsRegistered, validateLogin],
    userController.signIn
  );
};
