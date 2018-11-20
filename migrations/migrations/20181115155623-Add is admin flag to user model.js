'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Users', 'isAdmin', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Users', 'isAdmin')
};
