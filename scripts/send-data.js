#! /usr/bin/env node
const request = require('request-promise-native');
const path = require('path');
const fs = require('fs');
const papa = require('papaparse');
const CLIProgressBar = require('cli-progress');

const CSV_HEADERS = {
  ID: 'Code_Cial',
  NAME: 'libelle_enseigne',
  ADDRESS: 'Adresse1',
  POSTAL_CODE: 'CP',
  MUNICIPALITY: 'Commune',
};

const argv = require('yargs')
  .option('localhost', {
    alias: 'L',
    describe: 'launch local requests instead of to the server',
  })
  .boolean('localhost')
  .option('file', {
    alias: 'f',
    describe: 'the path to the csv file to parse',
  })
  .option('token', {
    alias: 't',
    describe: 'the token to authenticate with the server',
  })
  .demandOption(['file', 'token'], 'Please provide the path to the csv file of address to process and the api token')
  .help()
  .wrap(120)
  .argv;

function buildRequestObject({ isLocalRequest, token, payload }) {
  return {
    baseUrl: 'http://localhost:5000',
    url: '/address',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    json: true,
    body: payload,
  };
}

function assertFileValidity(filePath) {
  const fileExists = fs.existsSync(filePath);
  if (!fileExists) {
    const errorMessage = `File not found ${filePath}`;
    throw new Error(errorMessage);
  }
  const fileExtension = path.extname(filePath);
  if (fileExtension !== '.csv') {
    const errorMessage = `File extension not supported ${fileExtension}`;
    throw new Error(errorMessage);
  }
  return true;
}

function generatePayloadFromCSVRow(csvRow) {
  const address = {
    id: csvRow[CSV_HEADERS.ID],
    name: csvRow[CSV_HEADERS.NAME],
    address: csvRow[CSV_HEADERS.ADDRESS],
    postalCode: csvRow[CSV_HEADERS.POSTAL_CODE],
    municipality: csvRow[CSV_HEADERS.MUNICIPALITY],
  };
  return address;
}

function main() {

  console.log('\nScript Started');

  const token = argv.token;
  const filePath = argv.file;
  const isLocalRequest = argv.localhost;

  const progressBar = new CLIProgressBar.Bar({}, CLIProgressBar.Presets.rect);

  // ETAPE 1
  console.log('\nTest de validité du fichier...');

  try {
    assertFileValidity(filePath);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  console.log('Test de validité du fichier : OK');

  // ETAPE 2
  console.log('\nLecture du csv...');

  new Promise(function(resolve, reject) {
    fs.readFile(filePath, 'utf8', function(err, data) {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  })
    .then((data) => {
      console.log('Cleaning csv header...');

      // We delete the BOM UTF8 at the beginning of the CSV,
      // otherwise the first element is wrongly parsed.
      return data.toString('utf8').replace(/^\uFEFF/, '');
    })
    .then((csvRawData) => {
      console.log('Parsing csv data...');

      return papa.parse(csvRawData, { header: true });
    })
    .then((csvParsingResult) => {

      console.log('Start uploading data...');
      const dataRows = csvParsingResult.data;


      const initialPromise = Promise.resolve()
        .then(() => {
          progressBar.start(dataRows.length, 0);
          return 0;
        });

      return dataRows.reduce((sequentialPromises, dataRow) => {

        return sequentialPromises
          .then((index) => {

            const payload = generatePayloadFromCSVRow(dataRow);
            const requestConfig = buildRequestObject({ isLocalRequest, token, payload });

            return request(requestConfig)
              .then(() => {
                index++;
                progressBar.update(index);
                return index;
              });
          });

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