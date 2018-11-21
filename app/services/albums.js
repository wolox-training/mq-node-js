const request = require('request-promise-native');

exports.getAlbums = () => request({ uri: process.env.ALBUMS_HOST + process.env.ALBUMS_PATH, json: true });
