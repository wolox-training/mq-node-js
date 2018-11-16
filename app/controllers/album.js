const jwt = require('../services/jwt'),
  getUserForToken = require('./user').getUserForToken;

exports.listAlbums = (req, res, next) => {
  return getUserForToken(req.headers.token)
    .then(user => res.status(200).redirect('https://jsonplaceholder.typicode.com/albums'))
    .catch(next);
};
