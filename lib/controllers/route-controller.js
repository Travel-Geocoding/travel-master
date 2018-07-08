RouteRepository = require('../repositories/route-repository');

module.exports = {

  getRoutesPaginated(request, h) {
    const pageToGet = request.query.page;

    return RouteRepository.listWithPagination({ pageNumber: pageToGet })
      .then((routePaginationResult) => {
        return h.response(routePaginationResult);
      });
  },

  getRouteCount(request, h) {
    return RouteRepository.countByType()
      .then((countObject) => {
        return h.response(countObject);
      });
  },
};
