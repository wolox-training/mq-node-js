const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  chaiSubset = require('chai-subset'),
  should = chai.should(),
  expect = chai.expect,
  errors = require('./../app/errors'),
  User = require('./../app/models').User,
  badRequestErrorMessages = require('./../app/controllers/user').badRequestErrorMessages,
  validationErrorMsgs = require('./../app/middlewares/user').validationErrorMessages,
  jwt = require('../app/services/jwt'),
  itemsPerPage = Number.parseInt(process.env.DEFAULT_ITEMS_PER_PAGE),
  testHelpers = require('./testHelpers'),
  nock = require('nock'),
  albumsController = require('../app/controllers/album');

chai.use(chaiSubset);

nock(albumsController.albumsHost)
  .get(albumsController.albumsPath)
  .replyWithFile(200, `${__dirname}/albums.json`, { 'Content-Type': 'application/json' })
  .persist();

describe('/albums GET', () => {
  it('should successfully return the registered user', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .get('/albums')
          .set('token', token)
          .send()
          .then(res => {
            expect(res.body).to.be.an('array');

            res.body.forEach(album => {
              expect(album).to.have.property('userId');
              expect(album).to.have.property('id');
              expect(album).to.have.property('title');
            });

            res.should.have.status(200);
            done();
          })
      )
    );
  });
});
