#! /usr/bin/env node
const request = require('request-promise-native');
const path = require('path');
const moment = require('moment');
const fileSystem = require('fs');
const Json2csvParser = require('json2csv').Parser;
const CLIProgressBar = require('cli-progress');

const CSV_HEADERS = {
  ID: 'Code_Cial',
  NAME: 'libelle_enseigne',
  ADDRESS: 'Adresse1',
  POSTAL_CODE: 'CP',
  MUNICIPALITY: 'Commune',
  MATCH_TYPE: 'Type de résultat',
  MATCH_ADDRESS: 'Adresse Google',
  LATITUDE: 'latitude',
  LONGITUDE: 'longitude',
};

const CSV_HEADER_ORDERED_LIST = [
  CSV_HEADERS.ID,
  CSV_HEADERS.NAME,
  CSV_HEADERS.ADDRESS,
  CSV_HEADERS.POSTAL_CODE,
  CSV_HEADERS.MUNICIPALITY,
  CSV_HEADERS.MATCH_TYPE,
  CSV_HEADERS.MATCH_ADDRESS,
  CSV_HEADERS.LATITUDE,
  CSV_HEADERS.LONGITUDE,
];

const CSV_DELIMITATOR = ';';
const CSV_EOL = '\r\n';

/*const i = {
  id: 'C0836',
  name: 'PETIT CASINO',
  address: '16 AVENUE RUESSIUM',
  postalCode: '43350',
  municipality: 'ST PAULIEN',
  matchType: null,
  matchedAddress: null,
  latitude: null,
  longitude: null,
};*/

const argv = require('yargs')
  .option('localhost', {
    alias: 'L',
    describe: 'launch local requests instead of to the server',
  })
  .boolean('localhost')
  .option('folder', {
    alias: 'f',
    describe: 'the folder where to create the csv file',
  })
  .option('token', {
    alias: 't',
    describe: 'the token to authenticate with the server',
  })
  .demandOption(['folder', 'token'], 'Please provide the path to the csv file of address to process and the api token')
  .help()
  .wrap(120)
  .argv;

function buildRequestObject({ isLocalRequest, token, pageNumber }) {
  return {
    baseUrl: 'http://localhost:5000',
    url: '/address',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    json: true,
    qs: {
      page: pageNumber,
    },
  };
}

function createFile({ folderPath, firstPartOfCSV }) {
  const fileName = `address_export_${moment().format('DD-MM-YYYY_HH-mm-ss')}.csv`;
  const filePath = path.join(folderPath, fileName);

  fileSystem.writeFileSync(filePath, firstPartOfCSV);
  return filePath;
}

function generateRowFromLocationJSON(locationJSON) {
  const rowToComplete = {};

  rowToComplete[CSV_HEADERS.ID] = locationJSON.id;
  rowToComplete[CSV_HEADERS.NAME] = locationJSON.name;
  rowToComplete[CSV_HEADERS.ADDRESS] = locationJSON.address;
  rowToComplete[CSV_HEADERS.POSTAL_CODE] = locationJSON.postalCode;
  rowToComplete[CSV_HEADERS.MUNICIPALITY] = locationJSON.municipality;
  rowToComplete[CSV_HEADERS.MATCH_TYPE] = locationJSON.matchType;
  rowToComplete[CSV_HEADERS.MATCH_ADDRESS] = locationJSON.matchedAddress;
  rowToComplete[CSV_HEADERS.LATITUDE] = locationJSON.latitude;
  rowToComplete[CSV_HEADERS.LONGITUDE] = locationJSON.longitude;

  return rowToComplete;
}

function main() {

  console.log('\nScript Started');

  const token = argv.token;
  const folderPath = argv.folder;
  const isLocalRequest = argv.localhost;
  const progressBar = new CLIProgressBar.Bar({}, CLIProgressBar.Presets.rect);
  const parser = new Json2csvParser({
    fields: CSV_HEADER_ORDERED_LIST,
    delimiter: CSV_DELIMITATOR,
    eol: CSV_EOL,
    withBOM: true,
    excelStrings: true,
  });
  const parserWithoutHeader = new Json2csvParser({
    fields: CSV_HEADER_ORDERED_LIST,
    delimiter: CSV_DELIMITATOR,
    eol: CSV_EOL,
    header: false,
    excelStrings: true,
  });

  let totalPageCount = 0;
  let totalRowCount = 0;

  Promise.resolve()
    .then(() => {
      return buildRequestObject({ isLocalRequest, token, pageNumber: 1 });
    })
    .then((requestConfig) => {
      return request(requestConfig);
    })
    .then((locationPageResult) => {
      totalPageCount = locationPageResult.page.totalPageCount;
      totalRowCount = locationPageResult.page.totalRowCount;

      return locationPageResult.locations;
    })
    .then((locations) => locations.map(generateRowFromLocationJSON))
    .then((locationCSVRows) => parser.parse(locationCSVRows) + CSV_EOL)
    .then((firstPartOfCSV) => {
      const filePath = createFile({ folderPath, firstPartOfCSV });

      console.log('Les données de certifications sont dans le fichier :' + filePath);

      progressBar.start(totalPageCount, 1);

      return filePath;
    })
    .then((filePath) => {

      const initialPromise = Promise.resolve();

      return Array.from({ length: totalPageCount - 1 }, (v, i) => i + 2)
        .reduce((sequentialPromises, pageNumber) => {
          const requestConfig = buildRequestObject({ isLocalRequest, token, pageNumber });

          return sequentialPromises
            .then(() => request(requestConfig))
            .then((locationPageResult) => {
              progressBar.update(locationPageResult.page.currentPageNumber);

              return locationPageResult.locations;
            })
            .then((locations) => locations.map(generateRowFromLocationJSON))
            .then((locationCSVRows) => parserWithoutHeader.parse(locationCSVRows) + CSV_EOL)
            .then((locationCSVString) => fileSystem.appendFileSync(filePath, locationCSVString));

        }, initialPromise);

    })
    .then(() => {
      progressBar.stop();
      console.log('Data uploaded');
    })
    .then(() => {
      console.log('\nScript Finished');
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

main();