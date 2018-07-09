const TABLE_NAME = 'routes';

exports.up = function(knex, Promise) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.string('google_status');
  })
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table(TABLE_NAME, function(table) {
      table.dropColumn('google_status');
    }),
  ]);
};

