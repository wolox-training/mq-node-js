const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  should = chai.should(),
  errors = require('./../app/errors'),
  User = require('./../app/models').User,
  validationErrorMessages = require('./../app/middlewares/user').validationErrorMessages;

const testEmail = 'someemail@wolox.com.ar',
  testPassword = 'somepassword1';

describe('/users POST', () => {
  it('should successfully create a user', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testEmail, password: testPassword })
      .then(res => {
        res.should.have.status(201);
        User.count({ where: { email: testEmail } }).then(count => {
          should.equal(count, 1);
          done();
        });
      });
  });

  it('should not create a user because the email is not an email', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: 'not an email', password: testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);

        should.equal(
          e.response.body.message.length,
          2,
          'We should expect two messages, one indicating message is required and another one indicating that the email must belong to Wolox'
        );

        should.equal(
          e.response.body.message.some(msg => msg === validationErrorMessages.emailIsRequired),
          true
        );

        should.equal(
          e.response.body.message.some(msg => msg === validationErrorMessages.emailMustBelongToWolox),
          true
        );

        done();
      });
  });

  it('should not create a user because the email does not belong to wolox', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: 'someemail@gmail.com', password: testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        should.equal(
          e.response.body.message.length,
          1,
          'We should expect only one message indicating that the email must belong to wolox'
        );

        should.equal(
          e.response.body.message.some(msg => msg === validationErrorMessages.emailMustBelongToWolox),
          true
        );

        done();
      });
  });

  it('should not create a user because the password is missing', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testEmail })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        should.equal(
          e.response.body.message.length,
          3,
          'We should expect three messages, password is required, at least 8 chars and alphanumeric'
        );
        should.equal(
          e.response.body.message.some(msg => msg === validationErrorMessages.passwordIsRequired),
          true
        );
        should.equal(
          e.response.body.message.some(
            msg => msg === validationErrorMessages.passwordMustBeAtLeast8CharsLong
          ),
          true
        );
        should.equal(
          e.response.body.message.some(msg => msg === validationErrorMessages.passwordMustBeAlphanumeric),
          true
        );
        done();
      });
  });

  it('should not create a user because the password is not alphanumeric', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testEmail, password: 'somepassword' })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        should.equal(
          e.response.body.message.length,
          1,
          'We should expect one messages indicating the password must be alphanumeric'
        );
        should.equal(
          e.response.body.message.some(msg => msg === validationErrorMessages.passwordMustBeAlphanumeric),
          true
        );
        done();
      });
  });

  it('should not create a user because the password is not long enough', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testEmail, password: 'pass1' })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        should.equal(
          e.response.body.message.length,
          1,
          'We should expect one messages indicating the password must be at least 8 characters long'
        );
        should.equal(
          e.response.body.message.some(
            msg => msg === validationErrorMessages.passwordMustBeAtLeast8CharsLong
          ),
          true
        );
        done();
      });
  });

  it('should not create a user because the last name is missing', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', email: testEmail, password: testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        should.equal(
          e.response.body.message.length,
          3,
          'We should expect three messages, lastName is required, string and not empty'
        );
        should.equal(
          e.response.body.message.some(
            msg => msg === validationErrorMessages.textFieldCantBeEmpty('lastName')
          ),
          true
        );
        should.equal(
          e.response.body.message.some(
            msg => msg === validationErrorMessages.textFieldMustBeString('lastName')
          ),
          true
        );
        should.equal(
          e.response.body.message.some(
            msg => msg === validationErrorMessages.textFieldIsRequired('lastName')
          ),
          true
        );
        done();
      });
  });

  it('should not create a user because the first name is missing', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ lastName: 'lastname', email: testEmail, password: testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        should.equal(
          e.response.body.message.length,
          3,
          'We should expect three messages, firstName is required, string and not empty'
        );
        should.equal(
          e.response.body.message.some(
            msg => msg === validationErrorMessages.textFieldCantBeEmpty('firstName')
          ),
          true
        );
        should.equal(
          e.response.body.message.some(
            msg => msg === validationErrorMessages.textFieldMustBeString('firstName')
          ),
          true
        );
        should.equal(
          e.response.body.message.some(
            msg => msg === validationErrorMessages.textFieldIsRequired('firstName')
          ),
          true
        );
        done();
      });
  });
});
