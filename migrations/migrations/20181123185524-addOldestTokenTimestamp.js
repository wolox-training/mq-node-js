'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Users', 'oldestTokenTimestamp', {
      allowNull: true,
      defaultValue: null,
      type: Sequelize.DATE
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Users', 'oldestTokenTimestamp')
};
