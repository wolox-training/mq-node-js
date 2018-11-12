'use strict';

const errors = require('../errors');

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

  User.createModel = user =>
    User.create(user).catch(e => {
      throw errors.databaseError(e.message);
    });

  return User;
};
