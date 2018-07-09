const BookshelfRoute = require('../datas/route');
const bookshelf = require('../bookshelf');
const Route = require('../models/route');
const RoutePaginationResult = require('../models/route-pagination-result');
const Page = require('../models/page');

function convertBookshelfToDomain(bookshelfRoutePaginationResult) {

  const page = new Page({
    currentPageNumber: bookshelfRoutePaginationResult.pagination.page,
    pageSize: bookshelfRoutePaginationResult.pagination.pageSize,
    totalPageCount: bookshelfRoutePaginationResult.pagination.pageCount,
    totalRowCount: bookshelfRoutePaginationResult.pagination.rowCount,
  });

  const routes = bookshelfRoutePaginationResult.models
    .map((bookshelfRoute) => new Route(bookshelfRoute.toJSON()));

  return new RoutePaginationResult({
    routes,
    page,
  });
}

module.exports = {

  listWithPagination({ pageNumber }) {

    console.log('listWithPagination pageNumber ', pageNumber);

    return BookshelfRoute
      .query({ whereNotNull: 'id' })
      .fetchPage({
        pageSize: 20,
        page: pageNumber,
      })
      .then(convertBookshelfToDomain)
      .catch((error) => {
        const server = require('../server/server-instance');
        server.logger().error(`Failed route repository get listWithPagination because: ${error}`);
        throw error;
      });
  },

  countByType() {
    return Promise.all([
      BookshelfRoute.query({ whereNotNull: 'id' }).count(),
      BookshelfRoute.query('where', 'state', '=', `${Route.State.NEED_GOOGLE}`).count(),
      BookshelfRoute.query('where', 'state', '=', `${Route.State.PROCESSING}`).count(),
      BookshelfRoute.query('where', 'state', '=', `${Route.State.DONE}`).count(),
    ])
      .then(([totalCount, needingGoogleCount, processing, done]) => {
        return { totalCount, needingGoogleCount, processing, done };
      });
  },

  resetProcessingToNeedGoogle() {
    return bookshelf.knex('routes')
      .where('state', '=', `${Route.State.PROCESSING}`)
      .update({
        state: `${Route.State.NEED_GOOGLE}`,
      });
  },
};

