const TABLE_NAME = 'routes';

exports.up = function(knex) {

  function table(t) {

    t.string('id').primary();
    t.string('state');

    t.string('startId');
    t.string('startLatitude');
    t.string('startLongitude');

    t.string('destinationId');
    t.string('destinationLatitude');
    t.string('destinationLongitude');

    t.string('straitDistance');

    t.string('googleStatus');

    t.string('travelMode');

    t.string('travelDistance');
    t.string('travelDuration');
    t.string('travelDurationText');

    t.string('travelInTrafficDistance');
    t.string('travelInTrafficDuration');
    t.string('travelInTrafficDurationText');

    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema
    .createTable(TABLE_NAME, table)
    .then(() => {
      console.log(`${TABLE_NAME} table is created!`);
    });
};

exports.down = function(knex) {

  return knex.schema
    .dropTable(TABLE_NAME)
    .then(() => {
      console.log(`${TABLE_NAME} table was dropped!`);
    });
};
