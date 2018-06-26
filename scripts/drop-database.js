const knexConfig = require('../db/knexfile');

const dbToDropName = knexConfig.development.connection.database;
const dbTempName = 'postgres';

knexConfig.development.connection.database = dbTempName;

const knex = require('knex')(knexConfig.development);

knex.raw(`DROP DATABASE ${dbToDropName};`)
  .then(function() {
    console.log('Database dropped');
    process.exit(0);
  });