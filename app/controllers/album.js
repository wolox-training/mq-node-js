const jwt = require('../services/jwt'),
  getUserForToken = require('./user').getUserForToken,
  request = require('request-promise-native'),
  albumsUri = 'https://jsonplaceholder.typicode.com/albums',
  errors = require('../errors');

const getAlbums = () => {
  return request({ uri: albumsUri, json: true }).catch(e => {
    throw errors.resourceNotFound('albums not available');
  });
};

exports.listAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => getAlbums().then(r => res.status(200).send(r)))
    .catch(next);
