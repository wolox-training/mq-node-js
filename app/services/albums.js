const request = require('request-promise-native'),
  errors = require('../errors');

exports.getAlbums = () =>
  request({ uri: process.env.ALBUMS_HOST + process.env.ALBUMS_PATH, json: true }).catch(e => {
    throw errors.resourceNotFound(errors.errorMessages.albumsNotAvailable);
  });

exports.getAlbum = albumId =>
  request({ uri: `${process.env.ALBUMS_HOST + process.env.ALBUMS_PATH}?id=${albumId}`, json: true })
    .catch(e => {
      throw errors.resourceNotFound(errors.errorMessages.albumNotAvailable);
    })
    .then(res => {
      if (!res[0]) throw errors.resourceNotFound(errors.errorMessages.albumNotAvailable);
      return res[0];
    });

exports.getPhotosForAlbum = albumId =>
  request({
    uri: `${process.env.ALBUMS_HOST + process.env.ALBUMS_PHOTOS_PATH}?albumId=${albumId}`,
    json: true
  }).catch(e => {
    throw errors.resourceNotFound(errors.errorMessages.albumPhotosNotAvailable);
  });
