const jwt = require('../services/jwt'),
  getUserForToken = require('./user').getUserForToken,
  request = require('request-promise-native'),
  errors = require('../errors'),
  PurchasedAlbum = require('../models').PurchasedAlbum;

exports.albumsHost = 'https://jsonplaceholder.typicode.com';
exports.albumsPath = '/albums';

const errorMsgs = {
  albumsNotAvailable: 'albums not available',
  inexistentAlbum: 'inexistent album',
  albumNotAvailable: 'album not available',
  albumAlreadyPurchased: 'The album was already purchased'
};

exports.errorMessages = errorMsgs;

const getAlbums = () =>
  request({ uri: exports.albumsHost + exports.albumsPath, json: true }).catch(e => {
    throw errors.resourceNotFound(errorMsgs.albumsNotAvailable);
  });

const getAlbum = albumId =>
  request({ uri: `${exports.albumsHost + exports.albumsPath}?id=${albumId}`, json: true })
    .catch(e => {
      throw errors.resourceNotFound(errorMsgs.albumNotAvailable);
    })
    .then(res => res[0]);

exports.listAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => getAlbums().then(r => res.status(200).send(r)))
    .catch(next);

exports.purchaseAlbum = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user =>
      getAlbum(req.params.id).then(album => {
        if (!album) throw errors.badRequest(errorMsgs.inexistentAlbum);
        return PurchasedAlbum.find({ where: { albumId: album.id, userId: user.id } }).then(existingAlbum => {
          if (existingAlbum) throw errors.badRequest(errorMsgs.albumAlreadyPurchased);
          else {
            return PurchasedAlbum.createModel({ albumId: album.id, userId: user.id }).then(
              indbPurchasedAlbum => {
                res
                  .status(201)
                  .send(indbPurchasedAlbum)
                  .end();
              }
            );
          }
        });
      })
    )
    .catch(next);
