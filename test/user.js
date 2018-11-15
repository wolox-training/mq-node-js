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
  usersPerPage = require('./../app/controllers/user').usersPerPage;

chai.use(chaiSubset);

const testPassword = 'somepassword1',
  testEmail = 'someemail@wolox.com.ar',
  alreadyUsedEmails = [];
const getNotUsedEmail = () => {
  // simply appends 's's to the start of testEmail until the email isnt found;
  let email = testEmail;
  while (alreadyUsedEmails.some(e => e === email)) email = `s${email}`;
  alreadyUsedEmails.push(email);
  return email;
};

const signUpTestUser = () =>
  chai
    .request(server)
    .post('/users')
    .set('content-type', 'application/json')
    .send({ firstName: 'name', lastName: 'surname', email: getNotUsedEmail(), password: testPassword });

const signUpTestUserAndReturnEmail = () => signUpTestUser().then(res => res.body.email);

const signUpMultipleUsers = amount => {
  const emailPromises = [...Array(amount).keys()].map(number => signUpTestUserAndReturnEmail());
  return Promise.all(emailPromises);
};
beforeEach('reset already used emails', done => {
  alreadyUsedEmails.splice(0, alreadyUsedEmails.length);
  done();
});

const logInAndReturnToken = email =>
  chai
    .request(server)
    .post('/users/sessions')
    .set('content-type', 'application/json')
    .send({ email, password: testPassword })
    .then(res => res.text);

const getUsersEmailsInPage = (token, page) =>
  chai
    .request(server)
    .get('/users')
    .set('token', token)
    .set('page', page)
    .send()
    .then(userListResponse => userListResponse.body.users.map(u => u.email));

describe('/users GET', () => {
  it('should successfully return the registered user', done => {
    signUpTestUserAndReturnEmail().then(signedUpEmail =>
      logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .send()
          .then(userListResponse => {
            should.equal(userListResponse.body.users[0].email, signedUpEmail);
            dictum.chai(userListResponse);
            done();
          })
      )
    );
  });

  it('should successfully return the two registered users', done => {
    signUpMultipleUsers(2).then(emails =>
      logInAndReturnToken(emails[0]).then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .send()
          .then(userListResponse => {
            const emailsInPage = userListResponse.body.users.map(u => u.email);
            expect(emailsInPage).to.containSubset(emails);
            expect(emailsInPage.length).to.equal(usersPerPage);
            done();
          })
      )
    );
  });

  it('it should only return the the amount of users per page', done => {
    signUpMultipleUsers(usersPerPage + 1).then(emails =>
      logInAndReturnToken(emails[0]).then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .send()
          .then(userListResponse => {
            const emailListResponse = userListResponse.body.users.map(u => u.email);
            expect(alreadyUsedEmails).to.containSubset(emailListResponse);
            expect(emailListResponse.length).to.equal(usersPerPage);
            done();
          })
      )
    );
  });

  it('should return diferent emails in diferent pages', done => {
    signUpMultipleUsers(usersPerPage * 2).then(emails =>
      logInAndReturnToken(emails[0]).then(token =>
        Promise.all([getUsersEmailsInPage(token, 0), getUsersEmailsInPage(token, 1)]).then(pages => {
          const firstPageEmails = pages[0];
          const secondPageEmails = pages[1];
          expect(firstPageEmails.length).to.equal(usersPerPage);
          expect(secondPageEmails.length).to.equal(usersPerPage);
          firstPageEmails.forEach(email => expect(secondPageEmails).to.not.contain(email));
          secondPageEmails.forEach(email => expect(firstPageEmails).to.not.contain(email));
          done();
        })
      )
    );
  });

  it('when registering usersPerPage + 1 users, page 1 should contain 1 element', done => {
    signUpMultipleUsers(usersPerPage + 1).then(emails =>
      logInAndReturnToken(emails[0]).then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .set('page', 1)
          .send()
          .then(userListResponse => {
            const emailListResponse = userListResponse.body.users.map(u => u.email);
            expect(alreadyUsedEmails).to.containSubset(emailListResponse);
            expect(emailListResponse.length).to.equal(1);
            done();
          })
      )
    );
  });

  it('should fail because the token is missing', done => {
    signUpTestUserAndReturnEmail()
      .then(email => logInAndReturnToken(email))
      .then(token =>
        chai
          .request(server)
          .get('/users')
          .send()
          .catch(e => {
            should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
            should.equal(e.status, 400);
            expect(e.response.body.message.length).to.equal(
              2,
              'We should expect two messages indicating the token is required and cant be empty'
            );
            expect(e.response.body.message).to.include(validationErrorMsgs.tokenIsRequired);
            expect(e.response.body.message).to.include(validationErrorMsgs.tokenCantBeEmpty);
            done();
          })
      );
  });

  it('should fail because the token is invalid', done => {
    chai
      .request(server)
      .get('/users')
      .set('token', 'some invalid token')
      .send()
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message).to.equal(badRequestErrorMessages.invalidToken);
        done();
      });
  });

  it('should fail because page is empty', done => {
    signUpTestUserAndReturnEmail()
      .then(email => logInAndReturnToken(email))
      .then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .set('page', '')
          .send()
          .catch(e => {
            should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
            should.equal(e.status, 400);
            expect(e.response.body.message.length).to.equal(
              2,
              'We should expect two messages indicating the page must be a number and not empty'
            );
            expect(e.response.body.message).to.include(validationErrorMsgs.pageCantBeEmpty);
            expect(e.response.body.message).to.include(validationErrorMsgs.pageMustBeANumber);
            done();
          })
      );
  });

  it('should fail because page is not a number', done => {
    signUpTestUserAndReturnEmail()
      .then(email => logInAndReturnToken(email))
      .then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .set('page', 'not a number')
          .send()
          .catch(e => {
            should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
            should.equal(e.status, 400);
            expect(e.response.body.message.length).to.equal(
              1,
              'We should expect one message indicating the page must be a number'
            );
            expect(e.response.body.message).to.include(validationErrorMsgs.pageMustBeANumber);
            done();
          })
      );
  });
});

describe('/users POST', () => {
  it('should successfully create a user', done => {
    signUpTestUser().then(res => {
      res.should.have.status(201);
      User.count({ where: { email: res.body.email } }).then(count => {
        should.equal(count, 1);
        dictum.chai(res);
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
        expect(e.response.body.message.length).to.equal(
          2,
          'We should expect two messages, one indicating message is required and another one indicating that the email must belong to Wolox'
        );
        expect(e.response.body.message).to.include(validationErrorMsgs.emailMustBelongToWolox);
        expect(e.response.body.message).to.include(validationErrorMsgs.emailIsRequired);
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
        expect(e.response.body.message.length).to.equal(
          1,
          'We should expect only one message indicating that the email must belong to wolox'
        );
        expect(e.response.body.message).to.include(validationErrorMsgs.emailMustBelongToWolox);
        done();
      });
  });

  it('should not create a user because the password is missing', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: getNotUsedEmail() })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          3,
          'We should expect three messages, password is required, at least 8 chars and alphanumeric'
        );
        expect(e.response.body.message).to.include(validationErrorMsgs.passwordIsRequired);
        expect(e.response.body.message).to.include(validationErrorMsgs.passwordMustBeAtLeast8CharsLong);
        expect(e.response.body.message).to.include(validationErrorMsgs.passwordMustBeAlphanumeric);
        done();
      });
  });

  it('should not create a user because the password is not alphanumeric', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: getNotUsedEmail(), password: 'somepassword' })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          1,
          'We should expect one messages indicating the password must be alphanumeric'
        );
        expect(e.response.body.message).to.include(validationErrorMsgs.passwordMustBeAlphanumeric);
        done();
      });
  });

  it('should not create a user because the password is not long enough', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: getNotUsedEmail(), password: 'pass1' })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          1,
          'We should expect one messages indicating the password must be at least 8 characters long'
        );
        expect(e.response.body.message).to.include(validationErrorMsgs.passwordMustBeAtLeast8CharsLong);
        done();
      });
  });

  it('should not create a user because the last name is missing', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', email: getNotUsedEmail(), password: testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          3,
          'We should expect three messages, lastName is required, string and not empty'
        );
        expect(e.response.body.message).to.include(validationErrorMsgs.textFieldCantBeEmpty('lastName'));
        expect(e.response.body.message).to.include(validationErrorMsgs.textFieldMustBeString('lastName'));
        expect(e.response.body.message).to.include(validationErrorMsgs.textFieldIsRequired('lastName'));
        done();
      });
  });

  it('should not create a user because the first name is missing', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ lastName: 'lastname', email: getNotUsedEmail(), password: testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);

        expect(e.response.body.message.length).to.equal(
          3,
          'We should expect three messages, firstName is required, string and not empty'
        );
        expect(e.response.body.message).to.include(validationErrorMsgs.textFieldCantBeEmpty('firstName'));
        expect(e.response.body.message).to.include(validationErrorMsgs.textFieldMustBeString('firstName'));
        expect(e.response.body.message).to.include(validationErrorMsgs.textFieldIsRequired('firstName'));
        done();
      });
  });
});

describe('/users/sessions POST', () => {
  it('should successfully log in a user', done => {
    signUpTestUserAndReturnEmail().then(signedUpEmail => {
      chai
        .request(server)
        .post('/users/sessions')
        .set('content-type', 'application/json')
        .send({ email: signedUpEmail, password: testPassword })
        .then(res => {
          res.should.have.status(200);
          should.exist(res.text);
          const payload = jwt.decode(res.text);
          should.exist(payload.email);
          should.equal(payload.email, signedUpEmail);
          dictum.chai(res);
          done();
        });
    });
  });

  it('should not log in because the email is not registered', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .set('content-type', 'application/json')
      .send({ email: 'nonRegisteredEmail@wolox.com.ar', password: testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        should.equal(e.response.body.message, badRequestErrorMessages.nonExistingUser);
        done();
      });
  });

  it('should not login a user because the password is invalid', done => {
    signUpTestUserAndReturnEmail().then(signedUpEmail => {
      chai
        .request(server)
        .post('/users/sessions')
        .set('content-type', 'application/json')
        .send({ email: signedUpEmail, password: `${testPassword}2` })
        .catch(e => {
          should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
          should.equal(e.status, 400);
          should.equal(e.response.body.message, badRequestErrorMessages.invalidPassword);
          done();
        });
    });
  });

  it('should not login a user because the password is missing', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .set('content-type', 'application/json')
      .send({ email: getNotUsedEmail() })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);

        expect(e.response.body.message.length).to.equal(
          3,
          'We should expect three messages, password is required, at least 8 chars and alphanumeric'
        );
        expect(e.response.body.message).to.include(validationErrorMsgs.passwordIsRequired);
        expect(e.response.body.message).to.include(validationErrorMsgs.passwordMustBeAtLeast8CharsLong);
        expect(e.response.body.message).to.include(validationErrorMsgs.passwordMustBeAlphanumeric);
        done();
      });
  });

  it('should not login a user because the email is missing', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .set('content-type', 'application/json')
      .send({ password: testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          2,
          'We should expect 2 messages, email is required and must belong to wolox'
        );
        expect(e.response.body.message).to.include(validationErrorMsgs.emailIsRequired);
        expect(e.response.body.message).to.include(validationErrorMsgs.emailMustBelongToWolox);
        done();
      });
  });
});
