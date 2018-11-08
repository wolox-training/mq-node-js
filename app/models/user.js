'use strict';

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false }
    },
    {
      paranoid: true,
      underscored: true,
      timestamps: true
    }
  );
  User.associate = function(models) {
    // associations can be defined here
  };

  User.generateHash = function(password) {
    return bcrypt.hash(password, bcrypt.genSaltSync(8));
  };

  User.validPassword = function(password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
