const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('../app'),
  chaiSubset = require('chai-subset'),
  should = chai.should(),
  expect = chai.expect,
  errors = require('../app/errors'),
  testHelpers = require('./testHelpers'),
  nock = require('nock'),
  itemsPerPage = Number.parseInt(process.env.DEFAULT_ITEMS_PER_PAGE),
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

afterEach('clean possible unused mocks', done => {
  nock.cleanAll();
  done();
});

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

describe('/albums/:id POST', () => {
  it('should successfully purchase album', done => {
    const albumIdToBuy = 1;

    const n = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .query({ id: albumIdToBuy })
      .reply(200, [albums.find(a => a.id === albumIdToBuy)], { 'Content-Type': 'application/json' });

    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .post(`/albums/${albumIdToBuy}`)
          .set('token', token)
          .send()
          .then(res => {
            res.should.have.status(201);
            expect(res.body).to.have.property('albumId');
            expect(res.body.albumId).to.equal(albumIdToBuy);
            n.done();
            done();
          })
      )
    );
  });

  it('should fail to purchase album because it was purchased already', done => {
    const albumIdToBuy = 1;

    const nocks = [...Array(2)].map(() =>
      nock(process.env.ALBUMS_HOST)
        .get(process.env.ALBUMS_PATH)
        .query({ id: albumIdToBuy })
        .reply(200, [albums.find(a => a.id === albumIdToBuy)], { 'Content-Type': 'application/json' })
    );

    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        testHelpers.purchaseAlbum(albumIdToBuy, token).then(() =>
          testHelpers.purchaseAlbum(albumIdToBuy, token).catch(e => {
            e.response.should.have.status(400);
            expect(e.response.body.message).to.equal(errorMessages.albumAlreadyPurchased);
            nocks.forEach(n => n.done());
            done();
          })
        )
      )
    );
  });

  it('should fail to purchase album because the token was not present', done => {
    chai
      .request(server)
      .post(`/albums/1`)
      .send()
      .catch(e => {
        e.response.should.have.status(400);
        expect(e.response.body.message[0]).to.equal(errorMessages.tokenIsRequired);
        done();
      });
  });

  it('should fail to purchase album because the token is invalid', done => {
    chai
      .request(server)
      .post(`/albums/1`)
      .set('token', 'someinvalidtoken')
      .send()
      .catch(e => {
        e.response.should.have.status(400);
        expect(e.response.body.message).to.equal(errorMessages.invalidToken);
        done();
      });
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
            expect(e.response.body.message[0]).to.equal(errorMessages.albumIdMustBeNumber);
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
            expect(e.response.body.message).to.equal(errorMessages.albumNotAvailable);
            done();
          })
      )
    );
  });
});

describe('/users/:userId/albums GET', () => {
  it('should list purchasedAlbums', done => {
    const albumIdToBuy = 1;
    const n = nock(process.env.ALBUMS_HOST)
      .get(process.env.ALBUMS_PATH)
      .query({ id: albumIdToBuy })
      .reply(200, [albums.find(a => a.id === albumIdToBuy)], { 'Content-Type': 'application/json' });

    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        testHelpers.purchaseAlbum(albumIdToBuy, token).then(() =>
          chai
            .request(server)
            .get(`/users/${id}/albums`)
            .set('token', token)
            .send()
            .then(r => {
              r.should.have.status(200);
              expect(r.body.length).to.equal(1);
              expect(r.body[0].albumId).to.equal(albumIdToBuy);
              done();
            })
        )
      );
    });
  });

  it('should list the two albums that were purchased', done => {
    const albumIdsToBuy = [1, 2];

    const nocks = albumIdsToBuy.map(albumId =>
      nock(process.env.ALBUMS_HOST)
        .get(process.env.ALBUMS_PATH)
        .query({ id: albumId })
        .reply(200, [albums.find(a => a.id === albumId)], { 'Content-Type': 'application/json' })
    );

    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        Promise.all(albumIdsToBuy.map(albumId => testHelpers.purchaseAlbum(albumId, token))).then(() =>
          chai
            .request(server)
            .get(`/users/${id}/albums`)
            .set('token', token)
            .send()
            .then(r => {
              r.should.have.status(200);
              expect(r.body.length).to.equal(albumIdsToBuy.length);
              expect(r.body.map(i => i.albumId)).to.containSubset(albumIdsToBuy);
              nocks.forEach(n => n.done());
              done();
            })
        )
      );
    });
  });

  it('should list only the amount of items per page', done => {
    const albumIdsToBuy = [...Array(itemsPerPage + 1).keys()].map(i => i + 1);

    const nocks = albumIdsToBuy.map(albumId =>
      nock(process.env.ALBUMS_HOST)
        .get(process.env.ALBUMS_PATH)
        .query({ id: albumId })
        .reply(200, [albums.find(a => a.id === albumId)], { 'Content-Type': 'application/json' })
    );

    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        Promise.all(albumIdsToBuy.map(albumId => testHelpers.purchaseAlbum(albumId, token))).then(() =>
          chai
            .request(server)
            .get(`/users/${id}/albums`)
            .set('token', token)
            .send()
            .then(r => {
              r.should.have.status(200);
              expect(r.body.length).to.equal(itemsPerPage);
              expect(albumIdsToBuy).to.containSubset(r.body.map(i => i.albumId));
              nocks.forEach(n => n.done());
              done();
            })
        )
      );
    });
  });

  it('should return only 1 item on page 1 when requesting itemsPerPage + 1 items', done => {
    const albumIdsToBuy = [...Array(itemsPerPage + 1).keys()].map(i => i + 1);

    const nocks = albumIdsToBuy.map(albumId =>
      nock(process.env.ALBUMS_HOST)
        .get(process.env.ALBUMS_PATH)
        .query({ id: albumId })
        .reply(200, [albums.find(a => a.id === albumId)], { 'Content-Type': 'application/json' })
    );

    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        Promise.all(albumIdsToBuy.map(albumId => testHelpers.purchaseAlbum(albumId, token))).then(() =>
          chai
            .request(server)
            .get(`/users/${id}/albums?page=1`)
            .set('token', token)
            .send()
            .then(r => {
              r.should.have.status(200);
              expect(r.body.length).to.equal(1);
              expect(albumIdsToBuy).to.containSubset(r.body.map(i => i.albumId));
              nocks.forEach(n => n.done());
              done();
            })
        )
      );
    });
  });

  it('should return the specified limit=itemsPerPage*2 on page 0', done => {
    const albumIdsToBuy = [...Array(itemsPerPage * 2).keys()].map(i => i + 1);

    const nocks = albumIdsToBuy.map(albumId =>
      nock(process.env.ALBUMS_HOST)
        .get(process.env.ALBUMS_PATH)
        .query({ id: albumId })
        .reply(200, [albums.find(a => a.id === albumId)], { 'Content-Type': 'application/json' })
    );

    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        Promise.all(albumIdsToBuy.map(albumId => testHelpers.purchaseAlbum(albumId, token))).then(() =>
          chai
            .request(server)
            .get(`/users/${id}/albums?limit=${itemsPerPage * 2}&page=0`)
            .set('token', token)
            .send()
            .then(r => {
              r.should.have.status(200);
              expect(r.body.length).to.equal(itemsPerPage * 2);
              expect(albumIdsToBuy).to.containSubset(r.body.map(i => i.albumId));
              expect(r.body.map(i => i.albumId)).to.containSubset(albumIdsToBuy);
              nocks.forEach(n => n.done());
              done();
            })
        )
      );
    });
  });

  it('should fail because the token is required', done => {
    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        chai
          .request(server)
          .get(`/users/${id}/albums`)
          .send()
          .catch(e => {
            e.response.should.have.status(400);
            expect(e.response.body.message[0]).to.equal(errorMessages.tokenIsRequired);
            done();
          })
      );
    });
  });

  it('should list no purchasedAlbums because no album has been purchased', done => {
    testHelpers.signUpTestUser().then(res => {
      const { email, id } = res.body;
      testHelpers.logInAndReturnToken(email).then(token =>
        chai
          .request(server)
          .get(`/users/${id}/albums`)
          .set('token', token)
          .send()
          .then(r => {
            r.should.have.status(200);
            expect(r.body.length).to.equal(0);
            done();
          })
      );
    });
  });
});
