class RoutePaginationResult {

  constructor({
    routes = [],
    page,
  }) {
    this.routes = routes;
    this.page = page;
  }
}

module.exports = RoutePaginationResult;
