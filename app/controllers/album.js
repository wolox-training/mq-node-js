const jwt = require('../services/jwt'),
  getUserForToken = require('./user').getUserForToken,
  request = require('request-promise-native'),
  errors = require('../errors'),
  PurchasedAlbum = require('../models').PurchasedAlbum,
  albumsService = require('../services/albums'),
  errorMessages = require('../errors').errorMessages;

const getAlbums = () =>
  request({ uri: exports.albumsHost + exports.albumsPath, json: true }).catch(e => {
    throw errors.resourceNotFound(errorMessages.albumsNotAvailable);
  });

const getAlbum = albumId =>
  request({ uri: `${exports.albumsHost + exports.albumsPath}?id=${albumId}`, json: true })
    .catch(e => {
      throw errors.resourceNotFound(errorMessages.albumNotAvailable);
    })
    .then(res => res[0]);

exports.listAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .catch(next)
    .then(user => albumsService.getAlbums().then(r => res.status(200).send(r)))
    .catch(e => next(errors.resourceNotFound(errorMessages.albumsNotAvailable)));

exports.purchaseAlbum = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user =>
      getAlbum(req.params.id).then(album => {
        if (!album) throw errors.badRequest(errorMessages.inexistentAlbum);
        return PurchasedAlbum.find({ where: { albumId: album.id, userId: user.id } }).then(existingAlbum => {
          if (existingAlbum) throw errors.badRequest(errorMessages.albumAlreadyPurchased);
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
