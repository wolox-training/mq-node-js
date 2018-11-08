const db = require('../models/index');

const passwordIsValid = function(pass) {
  // password must be at least 8 characters long and include numbers and letters.
  // \d regex matches any digit [0, 9]
  return pass.length > 8 && /\d/.test(pass);
};

function emailIsValid(email) {
  // ref: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const emailIsValidAndBelongsToWolox = function(email) {
  if (!emailIsValid(email)) return false;

  // checks if email is valid and if it's domain belongs to wolox.
  // regex exp replaces all characters up-to and including the last '@' with empty: ''
  // so: some@email@wolox.com.ar => wolox.com.ar
  const domain = email.replace(/.*@/, '');
  return domain === 'wolox.com.ar' && domain.length < email.length;
};

module.exports = {
  methodPOST: async (req, res) => {
    const parameters = {
      firstName: req.query.firstName,
      lastName: req.query.lastName,
      email: req.query.email,
      password: req.query.password
    };

    let errorMsg;

    // check if all fields are present and have truthy values.
    const allFieldsPresent = Object.values(parameters).every(v => v);
    if (!allFieldsPresent) errorMsg = 'firstName, lastName, email and password fields are required';

    if (!errorMsg && !emailIsValidAndBelongsToWolox(parameters.email))
      errorMsg = 'email must be valid and belong to wolox.com.ar domain';

    if (!errorMsg && !passwordIsValid(parameters.password))
      errorMsg = 'password must be alphanumeric and at least 8 characters long';

    if (!errorMsg) {
      try {
        const existingUser = await db.User.findOne({
          where: { email: parameters.email }
        });
        if (existingUser) errorMsg = 'email already exists!';
      } catch (err) {
        console.log(`DB Error: ${err}`);
        res.status(500).send();
        return;
      }
    }

    if (errorMsg) {
      console.log(errorMsg);
      res.status(400).send(errorMsg);
      return;
    }

    const newUser = db.User.build({
      firstName: parameters.firstName,
      lastName: parameters.lastName,
      email: parameters.email,
      password: await db.User.generateHash(parameters.password)
    });

    newUser
      .save()
      .then(user => {
        const msg = `User ${user.lastName}, ${user.firstName} created successfuly`;
        console.log(msg);
        res.status(200).send(msg);
      })
      .catch(err => {
        console.log(`DB Error: ${err}`);
        res.status(500).send();
      });
  }
};
