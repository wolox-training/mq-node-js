'use strict';

const User = require('./user').User,
  errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const PurchasedAlbum = sequelize.define(
    'PurchasedAlbum',
    {
      albumId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false, foreignKey: true }
    },
    {
      underscored: true,
      paranoid: true
    }
  );
  PurchasedAlbum.associate = function(models) {
    // associations can be defined here
    PurchasedAlbum.belongsTo(models.User, {
      foreignKey: 'userId'
    });

    models.User.hasMany(PurchasedAlbum, { foreignKey: 'userId' });
  };

  PurchasedAlbum.createModel = purchasedAlbum =>
    PurchasedAlbum.create(purchasedAlbum).catch(e => {
      throw errors.databaseError(e.message);
    });

  return PurchasedAlbum;
};
