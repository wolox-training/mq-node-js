'use strict';

const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      isAdmin: { type: DataTypes.BOOLEAN, allowNull: false },
      oldestTokenTimestamp: { type: DataTypes.DATE, allowNull: true }
    },
    {
      underscored: true,
      paranoid: true
    }
  );

  User.associate = function(models) {
    // associations can be defined here
  };

  User.createModel = user =>
    User.create(user).catch(e => {
      throw errors.databaseError(e.message);
    });

  User.findAllModels = where =>
    User.findAndCountAll(where).catch(e => {
      throw errors.databaseError(e.message);
    });

  User.findUser = email =>
    User.find({ where: { email } })
      .catch(e => {
        throw errors.databaseError(e.message);
      })
      .then(user => {
        if (!user) throw errors.databaseError(errors.errorMessages.nonExistingUser);
        return user;
      });

  return User;
};
