const jwt = require('../services/jwt'),
  errors = require('../errors'),
  PurchasedAlbum = require('../models').PurchasedAlbum,
  albumsService = require('../services/albums'),
  errorMessages = require('../errors').errorMessages,
  responsePaginationHelper = require('./responsePaginationHelper');

exports.listAlbums = (req, res, next) =>
  jwt
    .getUserForToken(req.headers.token)
    .then(user => albumsService.getAlbums().then(r => res.status(200).send(r)))
    .catch(next);

exports.purchaseAlbum = (req, res, next) =>
  jwt
    .getUserForToken(req.headers.token)
    .then(user =>
      albumsService.getAlbum(req.params.id).then(album =>
        PurchasedAlbum.findOneBy({ where: { albumId: album.id, userId: user.id } }).then(existingAlbum => {
          if (existingAlbum) throw errors.badRequest(errorMessages.albumAlreadyPurchased);
          return PurchasedAlbum.createModel({ albumId: album.id, userId: user.id }).then(
            indbPurchasedAlbum => {
              res
                .status(201)
                .send(indbPurchasedAlbum)
                .end();
            }
          );
        })
      )
    )
    .catch(next);

exports.listPurchasedAlbums = (req, res, next) =>
  jwt.getUserForToken(req.headers.token).then(user => {
    const userId = Number.parseInt(req.params.userId);
    if (!user.isAdmin && userId !== user.id)
      throw errors.badRequest(errorMessages.nonAdminUsersCanOnlySeeTheirPurchasedAlbums);
    return PurchasedAlbum.findAllModels({
      where: { userId: user.id },
      limit: responsePaginationHelper.parsePageLimit(req.query),
      offset: responsePaginationHelper.parseOffset(req.query)
    })
      .then(dbResponse =>
        res
          .status(200)
          .send(dbResponse.rows)
          .end()
      )
      .catch(next);
  });
