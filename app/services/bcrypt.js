const bcrypt = require('bcryptjs');

exports.hashPassword = password => bcrypt.hash(password, bcrypt.genSaltSync(8));
exports.isPasswordValid = (password, user) => bcrypt.compare(password, user.password);
