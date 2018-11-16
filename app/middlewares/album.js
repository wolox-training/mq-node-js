const { body, header, validationResult, param, query } = require('express-validator/check'),
  errors = require('../errors');

const errorMsgs = {
  albumIdMustBeNumber: 'the album id must be a number'
};

exports.validationErrorMessages = errorMsgs;

exports.validateAlbumId = param('id')
  .isNumeric()
  .withMessage(errorMsgs.albumIdMustBeNumber);
