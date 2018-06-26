const knexConfig = require('../db/knexfile');

const dbToCreateName = knexConfig.development.connection.database;
const dbTempName = 'postgres';

knexConfig.development.connection.database = dbTempName;

const knex = require('knex')(knexConfig.development);

knex.raw(`CREATE DATABASE ${dbToCreateName};`)
  .then(function() {
    console.log('Database created');
    process.exit(0);
  });