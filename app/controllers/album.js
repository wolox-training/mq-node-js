const jwt = require('../services/jwt'),
  getUserForToken = require('./user').getUserForToken,
  request = require('request-promise-native'),
  errors = require('../errors');

exports.albumsHost = 'https://jsonplaceholder.typicode.com';
exports.albumsPath = '/albums';

const getAlbums = () => {
  return request({ uri: exports.albumsHost + exports.albumsPath, json: true }).catch(e => {
    throw errors.resourceNotFound('albums not available');
  });
};

exports.listAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => getAlbums().then(r => res.status(200).send(r)))
    .catch(next);
