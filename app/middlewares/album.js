const errorMessages = require('../errors').errorMessages,
  { param } = require('express-validator/check');

exports.validateAlbumId = param('id')
  .isNumeric()
  .withMessage(errorMessages.albumIdMustBeNumber);
