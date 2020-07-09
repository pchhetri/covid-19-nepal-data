const fs = require('fs');
const logger = require('./logger');

/**
 * Appends provided CSV data to an existing CSV file, adds a newline at the end
 *
 * @param   {String}  csv       new csv value
 * @param   {String}  filepath  normalized file path using Node's path module
 *
 * @return
 */
function appendToCsv(csv, filepath) {
  fs.appendFile(filepath, `${csv}\n`, (err) => {
    if (err) {
      logger.error("Couldn't append the data", err);
      throw err;
    }
    const [csvFilename] = filepath.split('/').slice(-1);
    logger.info(`The data was appended to CSV file: ${csvFilename}`);
  });
}

/**
 * Returns current date in ISO format
 *
 * @return  {String}        Date in ISO format - 2020-01-01
 */
function getCurrDate() {
  const [isoDate] = new Date().toISOString().split('T');
  return isoDate;
}

/**
 * Modifies the passed object with the date property added. The date value is
 * set to the current date in ISO format - 2020-01-01
 *
 * @param   {Object}  object  [item description]
 *
 * @return  {Object}        Object with the current date added
 */
function addDate(object) {
  /* eslint-disable no-param-reassign */
  object.date = getCurrDate();
  return object;
  /* eslint-enable no-param-reassign */
}

module.exports = {
  appendToCsv,
  addDate,
  getCurrDate,
};
