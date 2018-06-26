// Update with your config settings.

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      database: 'travel_database',
      user: 'postgres',
      password: 'postgres',
    },
    pool: {
      min: 1,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 1,
      max: (parseInt(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE, '10') || 4),
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    ssl: ('true' === process.env.DATABASE_SSL_ENABLED),
  },

};
