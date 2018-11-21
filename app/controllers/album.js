const getUserForToken = require('./user').getUserForToken,
  albumsService = require('../services/albums'),
  errors = require('../errors'),
  errorMessages = require('../errors').errorMessages;

exports.listAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => albumsService.getAlbums().then(r => res.status(200).send(r)))
    .catch(next);
