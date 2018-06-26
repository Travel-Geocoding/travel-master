const TABLE_NAME = 'locations';

exports.up = function(knex) {

  function table(t) {

    t.string('id').primary();
    t.string('name');

    t.string('address');
    t.string('postalCode');
    t.string('municipality');

    t.string('matchType');
    t.string('matchedAddress');
    t.string('latitude');
    t.string('longitude');

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
