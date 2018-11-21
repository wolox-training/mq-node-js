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
      albumsService.getAlbum(req.params.id).then(album =>
        PurchasedAlbum.find({ where: { albumId: album.id, userId: user.id } }).then(existingAlbum => {
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
        })
      )
    )
    .catch(next);

exports.listPurchasedAlbums = (req, res, next) =>
  jwt.getUserForToken(req.headers.token).then(user => {
    const userId = Number.parseInt(req.params.userId);
    if (!user.isAdmin && userId !== user.id)
      throw errors.badRequest(errorMessages.nonAdminUsersCanOnlySeeTheirPurchasedAlbums);
    return PurchasedAlbum.findAll({ where: { userId: user.id } })
      .then(albums =>
        res
          .status(200)
          .send(albums)
          .end()
      )
      .catch(e => next(errors.databaseError(errorMessages.databaseFailed)));
  });

exports.listAlbumPhotos = (req, res, next) =>
  jwt
    .getUserForToken(req.headers.token)
    .then(user =>
      albumsService.getAlbum(req.params.id).then(album =>
        PurchasedAlbum.find({ where: { albumId: req.params.id, userId: user.id } }).then(purchasedAlbum => {
          if (!purchasedAlbum)
            throw errors.badRequest(errorMessages.youCanOnlyViewPhotosOfYourPurchasedAlbums);
          return albumsService.getPhotosForAlbum(purchasedAlbum.albumId).then(photos =>
            res
              .status(200)
              .send(photos)
              .end()
          );
        })
      )
    )
    .catch(next);
