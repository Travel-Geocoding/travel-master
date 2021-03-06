require('dotenv').config();
const REDIS_URL = process.env.SCALINGO_REDIS_URL;

const knexConfig = require('../db/knexfile');
const settings = require('../lib/settings');

const Redis = require('ioredis');
const redis = new Redis(REDIS_URL);

const knex = require('knex')(knexConfig[settings.environment]);

function tableNames(routesOnly) {
  if (routesOnly) {
    return ['routes'];
  } else {
    return ['locations', 'routes'];
  }
}

const argv = require('yargs')
  .option('routes', {
    alias: 'R',
    describe: 'clean only routes table',
  })
  .boolean('routes')
  .help()
  .wrap(120)
  .argv;


function main() {

  const routes = argv.routes;

  Promise.all(tableNames(routes).map((tableNameToClean) => {
    return knex(tableNameToClean)
      .del()
      .then((nbOfRowsDeleted) => {
        console.log(` > pg > ${nbOfRowsDeleted} rows deleted in ${tableNameToClean} table`);
      });
  }))
    .then(() => {

      return new Promise((resolve, reject) => {
        const stream = redis.scanStream();

        let keyDeleted = 0;

        stream.on('data', function(resultKeys) {
          keyDeleted = keyDeleted + resultKeys.length;
          const pipeline = redis.pipeline();
          pipeline.unlink(resultKeys).exec();
        });

        stream.on('end', function() {
          console.log(` > redis > keys deleted: ${keyDeleted}`);
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
