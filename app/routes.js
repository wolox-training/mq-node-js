const userSignUpController = require('./controllers/userSignUp');

exports.init = app => {
  app.post('/users', userSignUpController.methodPOST);
  // app.get('/endpoint/get/path', [], controller.methodGET);
  // app.put('/endpoint/put/path', [], controller.methodPUT);
  // app.post('/endpoint/post/path', [], controller.methodPOST);
};
