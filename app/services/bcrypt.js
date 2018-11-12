const bcrypt = require('bcryptjs');

exports.isPasswordValid = (password, user) => bcrypt.compare(password, user.password);
