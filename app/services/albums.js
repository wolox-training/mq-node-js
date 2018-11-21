const request = require('request-promise-native'),
  errors = require('../errors');

exports.getAlbums = () =>
  request({ uri: process.env.ALBUMS_HOST + process.env.ALBUMS_PATH, json: true }).catch(e => {
    throw errors.resourceNotFound(errors.errorMessages.albumsNotAvailable);
  });
