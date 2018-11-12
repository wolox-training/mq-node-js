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
  it('should create user successfully', () => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testEmail, password: testPassword })
      .then(res => {
        res.should.have.status(200);
        res.should.be.json;
        dictum.chai(res, 'description for endpoint');
      });
  });
});
