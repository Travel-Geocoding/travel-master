class Page {

  constructor({
    currentPageNumber,
    pageSize,
    totalPageCount,
    totalRowCount,
  }) {
    this.currentPageNumber = currentPageNumber;
    this.pageSize = pageSize;
    this.totalPageCount = totalPageCount;
    this.totalRowCount = totalRowCount;
  }
}

module.exports = Page;
