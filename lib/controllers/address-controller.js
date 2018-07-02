Job = require('../job-manager/job');
JobLauncher = require('../job-manager/job-launcher');
LocationRepository = require('../repositories/location-repository');

module.exports = {

  launchProcessing(request, reply) {

    let job;
    const { update } = request.query;

    if (!update) {

      const addressToCreate = {
        id: request.payload.id,
        name: request.payload.name,
        address: request.payload.address,
        postalCode: request.payload.postalCode,
        municipality: request.payload.municipality,
      };

      job = Job.createLocationFromAddress({ address: addressToCreate });

    } else {

      const addressToUpdate = {
        id: request.payload.id,
        name: request.payload.name,
        address: request.payload.address,
        postalCode: request.payload.postalCode,
        municipality: request.payload.municipality,
        matchType: request.payload.matchType,
        matchedAddress: request.payload.matchedAddress,
        latitude: request.payload.latitude,
        longitude: request.payload.longitude,
      };

      job = Job.updateLocationFromAddress({ address: addressToUpdate });
    }

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
