const getUserForToken = require('../services/jwt').getUserForToken,
  albumsService = require('../services/albums');

exports.listAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => albumsService.getAlbums().then(r => res.status(200).send(r)))
    .catch(next);
