require('dotenv').config();
const REDIS_URL = process.env.SCALINGO_REDIS_URL;

const knexConfig = require('../db/knexfile');
const settings = require('../lib/settings');

const Redis = require('ioredis');
const redis = new Redis(REDIS_URL);

const knex = require('knex')(knexConfig[settings.environment]);
const tableNames = ['locations'];

function main() {
  Promise.all(tableNames.map((tableNameToClean) => {
    return knex(tableNameToClean)
      .del()
      .then((nbOfRowsDeleted) => {
        console.log(` > pg > ${nbOfRowsDeleted} rows deleted in ${tableNameToClean} table`);
      });
  }))
    .then(() => {

      return new Promise((resolve, reject) => {
        const stream = redis.scanStream();

        stream.on('data', function(resultKeys) {
          console.log(` > redis > keys deleted: ${resultKeys.length}`);
          const pipeline = redis.pipeline();
          pipeline.unlink(resultKeys).exec();
        });

        stream.on('end', function() {
          console.log(' > redis > cleaning done');
          resolve();
        });
      });
    })
    .then(() => {
      console.log('Databases cleaned');
      process.exit(0);
    });
}

main();
