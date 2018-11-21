const userController = require('./controllers/user'),
  albumsController = require('./controllers/album'),
  {
    validateEmail,
    validateLogin,
    validatePassword,
    validateFirstName,
    validateLastName,
    validateSignUp,
    validateToken,
    validateErrors,
    validateTokenCanBeDecoded
  } = require('./middlewares/user');

exports.init = app => {
  app.post(
    '/users',
    [validateFirstName, validateLastName, validateEmail, validatePassword, validateSignUp],
    userController.signUp
  );
  app.post('/users/sessions', [validateEmail, validatePassword, validateLogin], userController.logIn);
  app.get('/albums', [validateToken, validateErrors], albumsController.listAlbums);
  app.get('/users', [validateToken, validateErrors, validateTokenCanBeDecoded], userController.listUsers);
  app.post(
    '/admin/users',
    [validateToken, validateFirstName, validateLastName, validateEmail, validatePassword, validateSignUp],
    userController.createAdmin
  );
};
