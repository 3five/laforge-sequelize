'use strict';
module.exports = function(sequelize, DataTypes) {
  var Person = sequelize.define('Person', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING
  }, {
    hooks: {
      afterUpdate: [
        function doThings(instance) {
          console.log(instance)
          return instance
        }
      ]
    }
  });
  return Person;
};