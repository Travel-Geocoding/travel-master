#! /usr/bin/env node

knex = require('../lib/bookshelf').knex;

function main() {
  knex('routes')
    .update({ google_status: knex.raw('??', ['googleStatus']) })
    .then(() => process.exit(0))
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
}

main();