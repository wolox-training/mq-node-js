const jwt = require('../services/jwt'),
  getUserForToken = require('./user').getUserForToken,
  request = require('request-promise-native'),
  albumsUri = 'https://jsonplaceholder.typicode.com/albums',
  errors = require('../errors'),
  PurchasedAlbum = require('../models').PurchasedAlbum;

const errorMsgs = {
  inexistentAlbum: 'Inexistent album',
  albumAlreadyPruchased: 'The album was already purchased',
  albumsNotAvailable: 'Albums not available'
};

exports.validationErrorMessages = errorMsgs;

const getAlbums = albumIds => {
  let requestUri = albumsUri;

  if (albumIds) {
    requestUri += '?';
    albumIds.forEach(albumId => {
      requestUri += `albumId=${albumId}`;
    });
  }

  return request({ uri: albumsUri, json: true }).catch(e => {
    throw errors.resourceNotFound(errorMsgs.albumsNotAvailable);
  });
};

// const getAlbum = albumId => getAlbums().then(albums => albums.find(a => a.id === albumId));
/* const getAlbum = albumId =>
  request({ uri: `${albumsUri}?albumId=${albumId}` }).catch(e => {
    throw errors.resourceNotFound('album not available');
  }); */

exports.listAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => getAlbums().then(r => res.status(200).send(r)))
    .catch(next);

exports.purchaseAlbum = (req, res, next) =>
  getUserForToken(req.headers.token).then(user => {
    const albumId = Number.parseInt(req.params.id);

    return getAlbums([albumId])
      .then(album => {
        if (!album) throw errors.badRequest('Inexsiting album');
        return album;
      })
      .then(album =>
        PurchasedAlbum.find({ where: { albumId: album.id, userId: user.id } }).then(existingAlbum => {
          if (existingAlbum) throw errors.badRequest('The album was already purchased');
          else {
            return PurchasedAlbum.createModel({ albumId, userId: user.id }).then(indbPurchasedAlbum => {
              res
                .status(201)
                .send(indbPurchasedAlbum)
                .end();
            });
          }
        })
      )
      .catch(next);
  });

exports.listPurchasedAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => {
      const userId = Number.parseInt(req.params.userId);
      if (!user.isAdmin && userId !== user.id)
        throw errors.badRequest('Non admin users can only access their own purchased albums');

      return PurchasedAlbum.findAll({ where: { userId: user.id } }).then(albums =>
        res
          .status(200)
          .send(albums)
          .end()
      );
    })
    .catch(next);
