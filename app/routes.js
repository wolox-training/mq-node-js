const userController = require('./controllers/user'),
  albumsController = require('./controllers/album'),
  {
    validateEmail,
    validateLogin,
    validatePassword,
    validateFirstName,
    validateLastName,
    validateSignUp,
    validateUserId,
    validateToken,
    validateErrors
  } = require('./middlewares/user'),
  { validateAlbumId } = require('./middlewares/album');

exports.init = app => {
  app.post(
    '/users',
    [validateFirstName, validateLastName, validateEmail, validatePassword, validateSignUp],
    userController.signUp
  );

  app.post('/users/sessions', [validateEmail, validatePassword, validateLogin], userController.logIn);

  app.get('/users', [validateToken, validateErrors], userController.listUsers);
  app.get('/albums', [validateToken, validateErrors], albumsController.listAlbums);
  app.post('/albums/:id', [validateToken, validateAlbumId, validateErrors], albumsController.purchaseAlbum);
  app.get(
    '/users/:userId/albums',
    [validateToken, validateUserId, validateErrors],
    albumsController.listPurchasedAlbums
  );

  app.get(
    '/users/albums/:id/photos',
    [validateToken, validateAlbumId, validateErrors],
    albumsController.listAlbumPhotos
  );
};
