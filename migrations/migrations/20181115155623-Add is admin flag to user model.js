'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'isAdmin', {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Todo', 'isAdmin');
  }
};
