'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Users', 'mostRecentTokenTimestamp', {
      allowNull: true,
      defaultValue: null,
      type: Sequelize.DATE
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Users', 'mostRecentTokenTimestamp')
};
