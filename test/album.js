const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('../app'),
  chaiSubset = require('chai-subset'),
  should = chai.should(),
  expect = chai.expect,
  errors = require('../app/errors'),
  testHelpers = require('./testHelpers'),
  nock = require('nock'),
  errorMessages = require('../app/errors').errorMessages;

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

describe('/albums GET', () => {
  it('should successfully return the albums', done => {
    const n = nock(process.env.ALBUMS_HOST)
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
            dictum.chai(res);
            n.done();
            done();
          })
      )
    );
  });

  it('should fail because nock is configured to do so', done => {
    const n = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .replyWithError('Not Found');
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .get('/albums')
          .set('token', token)
          .send()
          .then(res => console.log(`\n\n\n${'THEN'}\n\n\n`))
          .catch(e => {
            should.equal(e.response.body.internal_code, errors.RESOURCE_NOT_FOUND);
            should.equal(e.status, 404);
            expect(e.response.body.message).to.equal(errorMessages.albumsNotAvailable);
            n.done();
            done();
          })
      )
    );
  });
});
