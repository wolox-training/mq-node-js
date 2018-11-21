const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  chaiSubset = require('chai-subset'),
  should = chai.should(),
  expect = chai.expect,
  errors = require('./../app/errors'),
  User = require('./../app/models').User,
  errorMessages = require('./../app/errors').errorMessages,
  jwt = require('../app/services/jwt'),
  itemsPerPage = Number.parseInt(process.env.DEFAULT_ITEMS_PER_PAGE),
  testHelpers = require('./testHelpers'),
  config = require('../config');

chai.use(chaiSubset);

describe('/users GET', () => {
  it('should successfully return the registered user', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
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
    testHelpers.signUpMultipleUsers(2).then(emails =>
      testHelpers.logInAndReturnToken(emails[0]).then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .send()
          .then(userListResponse => {
            const emailsInPage = userListResponse.body.users.map(u => u.email);
            expect(emails).to.containSubset(emailsInPage);
            expect(emailsInPage.length).to.equal(itemsPerPage);
            done();
          })
      )
    );
  });

  it('should only return the the amount of users per page', done => {
    testHelpers.signUpMultipleUsers(itemsPerPage + 1).then(emails =>
      testHelpers.logInAndReturnToken(emails[0]).then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .send()
          .then(userListResponse => {
            const emailListResponse = userListResponse.body.users.map(u => u.email);
            expect(testHelpers.alreadyUsedEmails).to.containSubset(emailListResponse);
            expect(emailListResponse.length).to.equal(itemsPerPage);
            done();
          })
      )
    );
  });

  it('should return diferent emails in diferent pages', done => {
    testHelpers.signUpMultipleUsers(itemsPerPage * 2).then(emails =>
      testHelpers.logInAndReturnToken(emails[0]).then(token =>
        Promise.all([
          testHelpers.getUsersEmailsInPage(token, 0),
          testHelpers.getUsersEmailsInPage(token, 1)
        ]).then(pages => {
          const firstPageEmails = pages[0];
          const secondPageEmails = pages[1];

          expect(firstPageEmails.length).to.equal(itemsPerPage);
          expect(secondPageEmails.length).to.equal(itemsPerPage);

          firstPageEmails.forEach(email => expect(secondPageEmails).to.not.contain(email));
          secondPageEmails.forEach(email => expect(firstPageEmails).to.not.contain(email));

          done();
        })
      )
    );
  });

  it('when registering itemsPerPage + 1 users, page 1 should contain 1 element', done => {
    testHelpers.signUpMultipleUsers(itemsPerPage + 1).then(emails =>
      testHelpers.logInAndReturnToken(emails[0]).then(token =>
        chai
          .request(server)
          .get(`/users?page=1`)
          .set('token', token)
          .send()
          .then(userListResponse => {
            const emailListResponse = userListResponse.body.users.map(u => u.email);
            expect(testHelpers.alreadyUsedEmails).to.containSubset(emailListResponse);
            expect(emailListResponse.length).to.equal(1);
            done();
          })
      )
    );
  });

  it('should return limit users per page when specifying it', done => {
    const limit = 5;
    testHelpers.signUpMultipleUsers(limit).then(emails =>
      testHelpers.logInAndReturnToken(emails[0]).then(token =>
        chai
          .request(server)
          .get(`/users?limit=${limit}`)
          .set('token', token)
          .send()
          .then(userListResponse => {
            expect(userListResponse.body.users.length).to.equal(limit);
            done();
          })
      )
    );
  });

  it('should fail because the token is missing', done => {
    testHelpers
      .signUpTestUserAndReturnEmail()
      .then(email => testHelpers.logInAndReturnToken(email))
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
            expect(e.response.body.message).to.include(errorMessages.tokenIsRequired);
            expect(e.response.body.message).to.include(errorMessages.tokenCantBeEmpty);
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
        expect(e.response.body.message).to.equal(errorMessages.invalidToken);
        done();
      });
  });

  it('should return page 0 because page is empty', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(email =>
      testHelpers.logInAndReturnToken(email).then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .set('page', '')
          .send()
          .then(res => {
            expect(res.body.users.map(u => u.email)).to.contain(email);
            done();
          })
      )
    );
  });

  it('should return page 0 because page is not a number', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(email =>
      testHelpers.logInAndReturnToken(email).then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .set('page', 'not a number')
          .send()
          .then(res => {
            expect(res.body.users.map(u => u.email)).to.contain(email);
            done();
          })
      )
    );
  });
});

describe('/users POST', () => {
  it('should successfully create a user', done => {
    testHelpers.signUpTestUser().then(res => {
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
      .send({
        firstName: 'name',
        lastName: 'surname',
        email: 'not an email',
        password: testHelpers.testPassword
      })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          2,
          'We should expect two messages, one indicating message is required and another one indicating that the email must belong to Wolox'
        );
        expect(e.response.body.message).to.include(errorMessages.emailMustBelongToWolox);
        expect(e.response.body.message).to.include(errorMessages.emailIsRequired);
        done();
      });
  });

  it('should not create a user because the email does not belong to wolox', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({
        firstName: 'name',
        lastName: 'surname',
        email: 'someemail@gmail.com',
        password: testHelpers.testPassword
      })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          1,
          'We should expect only one message indicating that the email must belong to wolox'
        );
        expect(e.response.body.message).to.include(errorMessages.emailMustBelongToWolox);
        done();
      });
  });

  it('should not create a user because the password is missing', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', lastName: 'surname', email: testHelpers.getNotUsedEmail() })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          3,
          'We should expect three messages, password is required, at least 8 chars and alphanumeric'
        );
        expect(e.response.body.message).to.include(errorMessages.passwordIsRequired);
        expect(e.response.body.message).to.include(errorMessages.passwordMustBeAtLeast8CharsLong);
        expect(e.response.body.message).to.include(errorMessages.passwordMustBeAlphanumeric);
        done();
      });
  });

  it('should not create a user because the password is not alphanumeric', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({
        firstName: 'name',
        lastName: 'surname',
        email: testHelpers.getNotUsedEmail(),
        password: 'somepassword'
      })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          1,
          'We should expect one messages indicating the password must be alphanumeric'
        );
        expect(e.response.body.message).to.include(errorMessages.passwordMustBeAlphanumeric);
        done();
      });
  });

  it('should not create a user because the password is not long enough', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({
        firstName: 'name',
        lastName: 'surname',
        email: testHelpers.getNotUsedEmail(),
        password: 'pass1'
      })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          1,
          'We should expect one messages indicating the password must be at least 8 characters long'
        );
        expect(e.response.body.message).to.include(errorMessages.passwordMustBeAtLeast8CharsLong);
        done();
      });
  });

  it('should not create a user because the last name is missing', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({ firstName: 'name', email: testHelpers.getNotUsedEmail(), password: testHelpers.testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          3,
          'We should expect three messages, lastName is required, string and not empty'
        );
        expect(e.response.body.message).to.include(errorMessages.textFieldCantBeEmpty('lastName'));
        expect(e.response.body.message).to.include(errorMessages.textFieldMustBeString('lastName'));
        expect(e.response.body.message).to.include(errorMessages.textFieldIsRequired('lastName'));
        done();
      });
  });

  it('should not create a user because the first name is missing', done => {
    chai
      .request(server)
      .post('/users')
      .set('content-type', 'application/json')
      .send({
        lastName: 'lastname',
        email: testHelpers.getNotUsedEmail(),
        password: testHelpers.testPassword
      })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);

        expect(e.response.body.message.length).to.equal(
          3,
          'We should expect three messages, firstName is required, string and not empty'
        );
        expect(e.response.body.message).to.include(errorMessages.textFieldCantBeEmpty('firstName'));
        expect(e.response.body.message).to.include(errorMessages.textFieldMustBeString('firstName'));
        expect(e.response.body.message).to.include(errorMessages.textFieldIsRequired('firstName'));
        done();
      });
  });
});

describe('/users/sessions POST', () => {
  it('should successfully log in a user', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail => {
      chai
        .request(server)
        .post('/users/sessions')
        .set('content-type', 'application/json')
        .send({ email: signedUpEmail, password: testHelpers.testPassword })
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
      .send({ email: 'nonRegisteredEmail@wolox.com.ar', password: testHelpers.testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        should.equal(e.response.body.message, errorMessages.nonExistingUser);
        done();
      });
  });

  it('should not login a user because the password is invalid', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail => {
      chai
        .request(server)
        .post('/users/sessions')
        .set('content-type', 'application/json')
        .send({ email: signedUpEmail, password: `${testHelpers.testPassword}2` })
        .catch(e => {
          should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
          should.equal(e.status, 400);
          should.equal(e.response.body.message, errorMessages.invalidPassword);
          done();
        });
    });
  });

  it('should not login a user because the password is missing', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .set('content-type', 'application/json')
      .send({ email: testHelpers.getNotUsedEmail() })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);

        expect(e.response.body.message.length).to.equal(
          3,
          'We should expect three messages, password is required, at least 8 chars and alphanumeric'
        );
        expect(e.response.body.message).to.include(errorMessages.passwordIsRequired);
        expect(e.response.body.message).to.include(errorMessages.passwordMustBeAtLeast8CharsLong);
        expect(e.response.body.message).to.include(errorMessages.passwordMustBeAlphanumeric);
        done();
      });
  });

  it('should not login a user because the email is missing', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .set('content-type', 'application/json')
      .send({ password: testHelpers.testPassword })
      .catch(e => {
        should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
        should.equal(e.status, 400);
        expect(e.response.body.message.length).to.equal(
          2,
          'We should expect 2 messages, email is required and must belong to wolox'
        );
        expect(e.response.body.message).to.include(errorMessages.emailIsRequired);
        expect(e.response.body.message).to.include(errorMessages.emailMustBelongToWolox);
        done();
      });
  });

  it('should fail because the session has expired', done => {
    const timeoutToWait = (config.common.api.userSessionDurationInSeconds + 1) * 1000;
    testHelpers
      .signUpTestUserAsAdmin()
      .then(user => testHelpers.logInAndReturnToken(user.email))
      .then(token =>
        setTimeout(
          () =>
            chai
              .request(server)
              .post('/admin/users')
              .set('content-type', 'application/json')
              .set('token', token)
              .send({
                firstName: 'name',
                lastName: 'surname',
                email: testHelpers.getNotUsedEmail(),
                password: testHelpers.testPassword
              })
              .catch(e => {
                should.equal(e.response.body.internal_code, errors.AUTHENTICATION_ERROR);
                should.equal(e.status, 401);
                expect(e.response.body.message).to.equal('Token expired');
                done();
              }),
          timeoutToWait
        )
      );
  });
});

describe('/admin/users POST', () => {
  it('should fail because a non admin user cannot create a admin user', done => {
    testHelpers.signUpTestUserAndReturnEmail().then(signedUpEmail =>
      testHelpers.logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .post('/admin/users')
          .set('content-type', 'application/json')
          .set('token', token)
          .send({
            firstName: 'name',
            lastName: 'surname',
            email: testHelpers.getNotUsedEmail(),
            password: testHelpers.testPassword
          })
          .catch(e => {
            should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
            should.equal(e.status, 400);
            expect(e.response.body.message).to.equal(errorMessages.insufficientPermissions);
            done();
          })
      )
    );
  });

  it('should create a admin user because the requesting user is admin', done => {
    testHelpers.signUpTestUserAsAdmin().then(adminUser =>
      testHelpers.logInAndReturnToken(adminUser.email).then(adminRelatedToken =>
        chai
          .request(server)
          .post('/admin/users')
          .set('content-type', 'application/json')
          .set('token', adminRelatedToken)
          .send({
            firstName: 'name',
            lastName: 'surname',
            email: testHelpers.getNotUsedEmail(),
            password: testHelpers.testPassword
          })
          .then(res => {
            res.should.have.status(201);
            return User.find({ where: { email: res.body.email } }).then(newAdminUser => {
              expect(newAdminUser.isAdmin).to.equal(true);
              dictum.chai(res);
              done();
            });
          })
          .catch(e => {
            console.log(`\n\n\n${adminRelatedToken}\n\n\n`);
          })
      )
    );
  });

  it('should update the user to be admin because the requesting user is admin', done => {
    const updatedUserNewFirstName = 'some new first name';
    const updatedUserNewLastName = 'some new last name';
    testHelpers.signUpTestUserAsAdmin().then(adminUser =>
      testHelpers.signUpTestUserAndReturnEmail().then(testUserEmailToUpdateAsAdmin => {
        testHelpers.logInAndReturnToken(adminUser.email).then(adminRelatedToken =>
          chai
            .request(server)
            .post('/admin/users')
            .set('content-type', 'application/json')
            .set('token', adminRelatedToken)
            .send({
              firstName: updatedUserNewFirstName,
              lastName: updatedUserNewLastName,
              email: testUserEmailToUpdateAsAdmin,
              password: testHelpers.testPassword
            })
            .then(res => {
              res.should.have.status(200);
              return User.find({ where: { email: res.body.email } }).then(userUpdatedAsAdmin => {
                expect(userUpdatedAsAdmin.email).to.equal(testUserEmailToUpdateAsAdmin);
                expect(userUpdatedAsAdmin.firstName).to.equal(updatedUserNewFirstName);
                expect(userUpdatedAsAdmin.lastName).to.equal(updatedUserNewLastName);
                expect(userUpdatedAsAdmin.isAdmin).to.equal(true);
                done();
              });
            })
        );
      })
    );
  });
});
