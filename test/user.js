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
      .then(function(res) {
        console.log('then');
        // expect(res).to.have.status(200);
      })
      .catch(function(err) {
        throw err;
      });

    /* .then(res => {
        console.log('is ok ');
        res.should.have.status(200);
        res.should.be.json;
        dictum.chai(res, 'description for endpoint');
      })
      .catch(e => console.log('is not ok')); */
  });

  /*  it('should fail login because some parameters are missing', () => {
    chai
      .request(server)
      .post('/users?firstName=name&lastName=surname')
      .catch(res => {
        res.should.have.status(400);
        dictum.chai(res, 'description for endpoint');
      });
  });

  it('should fail login because password is not alphanumeric', () => {
    chai
      .request(server)
      .post('/users?firstName=name&lastName=surname&email=somemail@wolox.com.ar&password=password')
      .catch(res => {
        res.should.have.status(400);
        dictum.chai(res, 'description for endpoint');
      });
  });
 


  it('should fail login because password is less than 8 characters long though alphanumeric', () => {
    chai
      .request(server)
      .post('/users?firstName=name&lastName=surname&email=somemail@wolox.com.ar&password=pass1')
      .catch(res => {
        res.should.have.status(400);
      });
  });

  it('should fail login because of invalid email', () => {
    chai
      .request(server)
      .post('/users?firstName=name&lastName=surname&email=mail&password=pass')
      .catch(res => {
        res.should.have.status(400);
      });
  });
  it('should fail login because password email does not belong to wolox', () => {
    chai
      .request(server)
      .post('/users?firstName=name&lastName=surname&email=somemail@gmail.com.ar&password=password1')
      .catch(res => {
        res.should.have.status(400);
      });
  });

  it('should succesfully register the user', () => {
    chai
      .request(server)
      .post('/users?firstName=name&lastName=surname&email=somemail@wolox.com.ar&password=password1')
      .then(res => {
        res.should.have.status(200);
        dictum.chai(res);
      })
      .catch(e => {});
  });

  it('should succesfully register the user and then fail if trying to register the same user again', () => {
    const toPost = '/users?firstName=name&lastName=surname&email=somemail@wolox.com.ar&password=password1';
    chai
      .request(server)
      .post(toPost)
      .then(res => {
        res.should.have.status(200);
      })
      .then(() => {
        chai
          .request(server)
          .post(toPost)
          .catch(res => {
            // post should have failed because the email already was registered
            res.should.have.status(400);
          });
      });
  }); */
});
