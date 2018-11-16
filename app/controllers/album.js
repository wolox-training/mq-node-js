const jwt = require('../services/jwt'),
  getUserForToken = require('./user').getUserForToken,
  request = require('request-promise-native'),
  albumsUri = 'https://jsonplaceholder.typicode.com/albums',
  errors = require('../errors'),
  PurchasedAlbum = require('../models').PurchasedAlbum;

const errorMsgs = {
  inexistentAlbum: 'Inexistent album',
  albumAlreadyPruchased: 'The album was already purchased'
};

exports.validationErrorMessages = errorMsgs;

let albumsDataBase;
const getAlbums = () => {
  if (albumsDataBase) return Promise.resolve(albumsDataBase);
  // lazy initialization
  return request({ uri: albumsUri, json: true })
    .then(res => {
      albumsDataBase = res;
      return albumsDataBase;
    })
    .catch(e => {
      throw errors.resourceNotFound('albums not available');
    });
};

const getAlbum = albumId => getAlbums().then(albums => albums.find(a => a.id === albumId));

exports.listAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => getAlbums().then(r => res.status(200).send(r)))
    .catch(next);

exports.purchaseAlbum = (req, res, next) =>
  getUserForToken(req.headers.token).then(user => {
    const albumId = Number.parseInt(req.params.id);

    return getAlbum(albumId)
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
