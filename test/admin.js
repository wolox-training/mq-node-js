const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  chaiSubset = require('chai-subset'),
  should = chai.should(),
  expect = chai.expect,
  errors = require('./../app/errors'),
  User = require('./../app/models').User,
  badRequestErrorMessages = require('./../app/controllers/user').badRequestErrorMessages;

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
