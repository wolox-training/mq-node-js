const jwt = require('../services/jwt'),
  getUserForToken = require('./user').getUserForToken,
  request = require('request-promise-native'),
  albumsUri = 'https://jsonplaceholder.typicode.com/albums',
  albumsPhotosUri = 'https://jsonplaceholder.typicode.com/photos',
  errors = require('../errors'),
  PurchasedAlbum = require('../models').PurchasedAlbum;

const errorMsgs = {
  inexistentAlbum: 'Inexistent album',
  albumAlreadyPruchased: 'The album was already purchased',
  albumsPhotosNotAvailable: 'albums photos not available',
  albumsNotAvailable: 'albums not available',
  nonAdminUsersOnlySeeTheirAlbums: 'Non admin users can only access their own purchased albums',
  youCanOnlyViewPhotosOfYourPurchasedAlbums: 'You can only view photos of your purchased albums'
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
      throw errors.resourceNotFound(errorMsgs.albumsNotAvailable);
    });
};

const getAlbum = albumId =>
  getAlbums().then(albums => {
    const album = albums.find(a => a.id === albumId);
    if (!album) throw errors.badRequest(errorMsgs.inexistentAlbum);
    return album;
  });

let albumsPhotosDataBase;
const getAlbumsPhotos = () => {
  if (albumsPhotosDataBase) return Promise.resolve(albumsPhotosDataBase);
  // lazy initialization
  return request({ uri: albumsPhotosUri, json: true })
    .then(res => {
      albumsPhotosDataBase = res;
      return albumsPhotosDataBase;
    })
    .catch(e => {
      throw errors.resourceNotFound(errorMsgs.albumsPhotosNotAvailable);
    });
};

const getPhotosForAlbum = albumId =>
  getAlbumsPhotos().then(albumsPhotos => albumsPhotos.filter(a => a.albumId === albumId));

exports.listAlbums = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => getAlbums().then(r => res.status(200).send(r)))
    .catch(next);

exports.purchaseAlbum = (req, res, next) =>
  getUserForToken(req.headers.token).then(user => {
    const albumId = Number.parseInt(req.params.id);
    return getAlbum(albumId)
      .then(album =>
        PurchasedAlbum.find({ where: { albumId: album.id, userId: user.id } }).then(existingAlbum => {
          if (existingAlbum) throw errors.badRequest(errorMsgs.albumAlreadyPruchased);
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
        throw errors.badRequest(errorMsgs.nonAdminUsersOnlySeeTheirAlbums);

      return PurchasedAlbum.findAll({ where: { userId: user.id } }).then(albums =>
        res
          .status(200)
          .send(albums)
          .end()
      );
    })
    .catch(next);

exports.listAlbumPhotos = (req, res, next) =>
  getUserForToken(req.headers.token)
    .then(user => {
      const albumId = Number.parseInt(req.params.id);
      return getAlbum(albumId).then(album =>
        PurchasedAlbum.find({ where: { albumId, userId: user.id } }).then(purchasedAlbum => {
          if (!purchasedAlbum) throw errors.badRequest(errorMsgs.youCanOnlyViewPhotosOfYourPurchasedAlbums);
          return getPhotosForAlbum(purchasedAlbum.albumId).then(photos =>
            res
              .status(200)
              .send(photos)
              .end()
          );
        })
      );
    })
    .catch(next);
