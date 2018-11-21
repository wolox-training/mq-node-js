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
  albumValidationErrorMsgs = require('./../app/middlewares/album').validationErrorMessages,
  albumErrorMessages = require('./../app/controllers/album').errorMessages,
  jwt = require('../app/services/jwt'),
  itemsPerPage = Number.parseInt(process.env.DEFAULT_ITEMS_PER_PAGE),
  testHelpers = require('./testHelpers'),
  nock = require('nock');

chai.use(chaiSubset);

const albums = [
  {
    userId: 1,
    id: 1,
    title: 'quidem molestiae enim'
  },
  {
    userId: 1,
    id: 2,
    title: 'sunt qui excepturi placeat culpa'
  },
  {
    userId: 1,
    id: 3,
    title: 'omnis laborum odio'
  },
  {
    userId: 1,
    id: 4,
    title: 'non esse culpa molestiae omnis sed optio'
  },
  {
    userId: 1,
    id: 5,
    title: 'eaque aut omnis a'
  },
  {
    userId: 1,
    id: 6,
    title: 'natus impedit quibusdam illo est'
  },
  {
    userId: 1,
    id: 7,
    title: 'quibusdam autem aliquid et et quia'
  },
  {
    userId: 1,
    id: 8,
    title: 'qui fuga est a eum'
  },
  {
    userId: 1,
    id: 9,
    title: 'saepe unde necessitatibus rem'
  },
  {
    userId: 1,
    id: 10,
    title: 'distinctio laborum qui'
  }
];

beforeEach('Restore nock scopes', done => {
  nock.restore();
  nock.cleanAll();
  done();
});

describe('/albums GET', () => {
  it('should successfully return the registered user', done => {
    nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .reply(200, albums, { 'Content-Type': 'application/json' });
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

/*
describe('/albums/:id POST', () => {
  it('should successfully purchase album', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .post('/albums/1')
          .set('token', token)
          .send()
          .then(res => {
            res.should.have.status(201);
            done();
          })
      )
    );
  });

  it('should fail to purchase album because id is not a number', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .post('/albums/asd')
          .set('token', token)
          .send()
          .catch(e => {
            e.response.should.have.status(400);
            expect(e.response.body.message.length).to.equal(
              1,
              'We should expect one message indicating album id must me a number'
            );
            expect(e.response.body.message).to.include(albumValidationErrorMsgs.albumIdMustBeNumber);
            done();
          })
      )
    );
  });

  it('should fail to purchase album because id is non existent', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .post('/albums/99999')
          .set('token', token)
          .send()
          .catch(e => {
            e.response.should.have.status(404);
            expect(e.response.body.message).to.equal(albumErrorMessages.inexistentAlbum);
            done();
          })
      )
    );
  });
}); */
