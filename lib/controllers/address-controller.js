Job = require('../job-manager/job');
JobLauncher = require('../job-manager/job-launcher');
LocationRepository = require('../repositories/location-repository');

module.exports = {

  launchProcessing(request, reply) {

    console.log(request.payload);
    const address = {
      id: request.payload.id,
      name: request.payload.name,
      address: request.payload.address,
      postalCode: request.payload.postalCode,
      municipality: request.payload.municipality,
    };

    const job = Job.createLocationFromAddress({ address });

    JobLauncher.launch({ job });

    return reply.response()
      .code(204);
  },

  getLocationsPaginated(request, reply) {
    const pageToGet = request.query.page;

    return LocationRepository.listWithPagination({ pageNumber: pageToGet })
      .then((locationPaginationResult) => {
        return reply.response(locationPaginationResult);
      });
  },
};
