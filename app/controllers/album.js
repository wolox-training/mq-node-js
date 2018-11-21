const jwt = require('../services/jwt'),
  errors = require('../errors'),
  PurchasedAlbum = require('../models').PurchasedAlbum,
  albumsService = require('../services/albums'),
  errorMessages = require('../errors').errorMessages;

exports.listAlbums = (req, res, next) =>
  jwt
    .getUserForToken(req.headers.token)
    .then(user => albumsService.getAlbums().then(r => res.status(200).send(r)))
    .catch(e => next(errors.resourceNotFound(errorMessages.albumsNotAvailable)));

exports.purchaseAlbum = (req, res, next) =>
  jwt
    .getUserForToken(req.headers.token)
    .then(user =>
      albumsService.getAlbum(req.params.id).then(album => {
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
