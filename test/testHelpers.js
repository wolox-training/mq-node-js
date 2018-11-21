const chai = require('chai'),
  server = require('./../app'),
  User = require('../app/models').User;

exports.testPassword = 'somepassword1';
exports.testEmail = 'someemail@wolox.com.ar';
exports.alreadyUsedEmails = [];

exports.getNotUsedEmail = () => {
  // simply appends 's's to the start of testEmail until the email isnt found;
  let email = exports.testEmail;
  while (exports.alreadyUsedEmails.some(e => e === email)) email = `s${email}`;
  exports.alreadyUsedEmails.push(email);
  return email;
};

exports.signUpTestUser = () =>
  chai
    .request(server)
    .post('/users')
    .set('content-type', 'application/json')
    .send({
      firstName: 'name',
      lastName: 'surname',
      email: exports.getNotUsedEmail(),
      password: exports.testPassword
    });

exports.signUpTestUserAndReturnEmail = () => exports.signUpTestUser().then(res => res.body.email);

exports.signUpMultipleUsers = amount => {
  const emailPromises = [...Array(amount).keys()].map(() => exports.signUpTestUserAndReturnEmail());
  return Promise.all(emailPromises);
};

exports.signUpTestUserAsAdmin = () =>
  exports
    .signUpTestUserAndReturnEmail()
    .then(email => User.find({ where: { email } }))
    .then(user => user.update({ isAdmin: true }));

beforeEach('reset already used emails', done => {
  exports.alreadyUsedEmails.splice(0, exports.alreadyUsedEmails.length);
  done();
});

exports.logInAndReturnToken = email =>
  chai
    .request(server)
    .post('/users/sessions')
    .set('content-type', 'application/json')
    .send({ email, password: exports.testPassword })
    .then(res => res.text);

exports.getUsersEmailsInPage = (token, page) =>
  chai
    .request(server)
    .get(`/users?page=${page}`)
    .set('token', token)
    .send()
    .then(userListResponse => userListResponse.body.users.map(u => u.email));

exports.getUsersEmailsInPageWithLimit = (token, page, limit) =>
  chai
    .request(server)
    .get(`/users?page=${page}$limit=${limit}`)
    .set('token', token)
    .send()
    .then(userListResponse => userListResponse.body.users.map(u => u.email));

exports.purchaseAlbum = (albumId, token) =>
  chai
    .request(server)
    .post(`/albums/${albumId}`)
    .set('token', token)
    .send();
