const BookshelfLocation = require('../datas/location');
const Location = require('../models/location');
const LocationPaginationResult = require('../models/location-pagination-result');
const Page = require('../models/page');

function convertBookshelfToDomain(bookshelfLocationPaginationResult) {

  const page = new Page({
    currentPageNumber: bookshelfLocationPaginationResult.pagination.page,
    pageSize: bookshelfLocationPaginationResult.pagination.pageSize,
    totalPageCount: bookshelfLocationPaginationResult.pagination.pageCount,
    totalRowCount: bookshelfLocationPaginationResult.pagination.rowCount,
  });

  const locations = bookshelfLocationPaginationResult.models
    .map((bookshelfLocation) => new Location(bookshelfLocation.toJSON()));

  return new LocationPaginationResult({
    locations,
    page,
  });
}

module.exports = {

  listWithPagination({ pageNumber }) {

    return BookshelfLocation
      .query({ whereNotNull: 'id' })
      .fetchPage({
        pageSize: 20,
        page: pageNumber,
      })
      .then(convertBookshelfToDomain);
  },
};

