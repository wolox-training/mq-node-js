const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should();

const testEmail = 'someemail@wolox.com.ar',
  testPassword = 'somepassword1';

const registerTestUser = async function() {
  chai
    .request(server)
    .post(`/users?firstName=name&lastName=surname&email=${testEmail}&password=${testPassword}`);
};

describe('/users POST', () => {
  it('should successfully create a user', function(done) {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testEmail, password: testPassword })
      .end(function(err, res) {
        res.should.have.status(201);
        should.not.exist(err);
        dictum.chai(
          res,
          'Endpoint to create a new user providing first name, last name, a wolox email account and password being at least 8 characters long and alphanumeric'
        );
        done();
      });
  });

  it('should not create a user because the email is not an email', function(done) {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: 'not an email', password: testPassword })
      .end(function(err, res) {
        res.should.have.status(400);
        should.exist(err);
        done();
      });
  });

  it('should not create a user because the email does not belong to wolox', function(done) {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: 'someemail@gmail.com', password: testPassword })
      .end(function(err, res) {
        res.should.have.status(400);
        should.exist(err);
        done();
      });
  });

  it('should not create a user because the password is missing', function(done) {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testEmail })
      .end(function(err, res) {
        res.should.have.status(400);
        should.exist(err);
        done();
      });
  });

  it('should not create a user because the password is not alphanumeric', function(done) {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testEmail, password: 'somepassword' })
      .end(function(err, res) {
        res.should.have.status(400);
        should.exist(err);
        done();
      });
  });

  it('should not create a user because the password is not long enough', function(done) {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testEmail, password: 'pass1' })
      .end(function(err, res) {
        res.should.have.status(400);
        should.exist(err);
        done();
      });
  });

  it('should not create a user because the last name is missing', function(done) {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', email: testEmail, password: testPassword })
      .end(function(err, res) {
        res.should.have.status(400);
        should.exist(err);
        done();
      });
  });

  it('should not create a user because the first name is missing', function(done) {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ lastName: 'lastname', email: testEmail, password: testPassword })
      .end(function(err, res) {
        res.should.have.status(400);
        should.exist(err);
        done();
      });
  });
});
