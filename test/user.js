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
  testPassword = 'somepassword1',
  testEmail = 'someemail@wolox.com.ar',
  alreadyUsedEmails = [];

chai.use(chaiSubset);

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

const signUpTestUserAsAdmin = () =>
  signUpTestUserAndReturnEmail().then(signedUpEmail =>
    User.find({ where: { email: signedUpEmail } }).then(dbUser => {
      // set this created user to be admin.
      return dbUser.update({ isAdmin: true });
    })
  );

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
    .get(`/users?page=${page}`)
    .set('token', token)
    .send()
    .then(userListResponse => userListResponse.body.users.map(u => u.email));
const getUsersEmailsInPageWithLimit = (token, page, limit) =>
  chai
    .request(server)
    .get(`/users?page=${page}$limit=${limit}`)
    .set('token', token)
    .send()
    .then(userListResponse => userListResponse.body.users.map(u => u.email));

describe('/admin/users POST', () => {
  it('should fail because a non admin user cannot create a admin user', done => {
    signUpTestUserAndReturnEmail().then(signedUpEmail =>
      logInAndReturnToken(signedUpEmail).then(token =>
        chai
          .request(server)
          .post('/admin/users')
          .set('content-type', 'application/json')
          .set('token', token)
          .send({ firstName: 'name', lastName: 'surname', email: getNotUsedEmail(), password: testPassword })
          .catch(e => {
            should.equal(e.response.body.internal_code, errors.BAD_REQUEST);
            should.equal(e.status, 400);
            expect(e.response.body.message).to.equal(badRequestErrorMessages.insufficientPermissions);
            done();
          })
      )
    );
  });

  it('should create a admin user because the requesting user is admin', done => {
    signUpTestUserAsAdmin().then(adminUser =>
      logInAndReturnToken(adminUser.email).then(adminRelatedToken =>
        chai
          .request(server)
          .post('/admin/users')
          .set('content-type', 'application/json')
          .set('token', adminRelatedToken)
          .send({
            firstName: 'name',
            lastName: 'surname',
            email: getNotUsedEmail(),
            password: testPassword
          })
          .then(res => {
            res.should.have.status(201);
            return User.find({ where: { email: res.body.email } }).then(newAdminUser => {
              expect(newAdminUser.isAdmin).to.equal(true);
              dictum.chai(res);
              done();
            });
          })
      )
    );
  });

  it('should update the user to be admin because the requesting user is admin', done => {
    const updatedUserNewFirstName = 'some new first name';
    const updatedUserNewLastName = 'some new last name';
    signUpTestUserAsAdmin().then(adminUser =>
      signUpTestUserAndReturnEmail().then(testUserEmailToUpdateAsAdmin => {
        logInAndReturnToken(adminUser.email).then(adminRelatedToken =>
          chai
            .request(server)
            .post('/admin/users')
            .set('content-type', 'application/json')
            .set('token', adminRelatedToken)
            .send({
              firstName: updatedUserNewFirstName,
              lastName: updatedUserNewLastName,
              email: testUserEmailToUpdateAsAdmin,
              password: testPassword
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
            expect(emails).to.containSubset(emailsInPage);
            expect(emailsInPage.length).to.equal(itemsPerPage);
            done();
          })
      )
    );
  });

  it('should only return the the amount of users per page', done => {
    signUpMultipleUsers(itemsPerPage + 1).then(emails =>
      logInAndReturnToken(emails[0]).then(token =>
        chai
          .request(server)
          .get('/users')
          .set('token', token)
          .send()
          .then(userListResponse => {
            const emailListResponse = userListResponse.body.users.map(u => u.email);
            expect(alreadyUsedEmails).to.containSubset(emailListResponse);
            expect(emailListResponse.length).to.equal(itemsPerPage);
            done();
          })
      )
    );
  });

  it('should return diferent emails in diferent pages', done => {
    signUpMultipleUsers(itemsPerPage * 2).then(emails =>
      logInAndReturnToken(emails[0]).then(token =>
        Promise.all([getUsersEmailsInPage(token, 0), getUsersEmailsInPage(token, 1)]).then(pages => {
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
    signUpMultipleUsers(itemsPerPage + 1).then(emails =>
      logInAndReturnToken(emails[0]).then(token =>
        chai
          .request(server)
          .get(`/users?page=1`)
          .set('token', token)
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

  it('should return limit users per page when specifying it', done => {
    const limit = 5;
    signUpMultipleUsers(limit).then(emails =>
      logInAndReturnToken(emails[0]).then(token =>
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

  it('should return page 0 because page is empty', done => {
    signUpTestUserAndReturnEmail().then(email =>
      logInAndReturnToken(email).then(token =>
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
    signUpTestUserAndReturnEmail().then(email =>
      logInAndReturnToken(email).then(token =>
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
