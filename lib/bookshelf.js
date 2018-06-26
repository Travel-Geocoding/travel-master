const knexConfig = require('../db/knexfile');
const settings = require('./settings');
const knex = require('knex')(knexConfig[settings.environment]);

const bookshelf = require('bookshelf')(knex);

bookshelf.plugin('registry');
bookshelf.plugin('pagination');

module.exports = bookshelf;
