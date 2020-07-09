const axios = require('axios');
const cheerio = require('cheerio');

const overviewCsv = require('./overview-csv');
const districtCsv = require('./district-csv');
const logger = require('../utils/logger');

/**
 * Parses the HTML using Cheerio and returns the district JSON data
 *
 * @param   {CheerioSelector}  $
 *
 * @return  {Object}     District data
 */
const parseDistrictData = ($) => {
  const inlineScripts = $('script:not([src])');
  let districtData;
  $(inlineScripts).each((idx, elem) => {
    const inlineContent = $(elem).get()[0].children[0].data;
    if (inlineContent.match('var district_data')) {
      const regExp = /var district_data = JSON.parse\('(.*?)'\)/;
      const matches = regExp.exec(inlineContent);
      districtData = JSON.parse(matches[1]);
      return false;
    }
    return true;
  });
  return districtData;
};

/**
 * Parses the HTML using Cheerio and returns the overview / Nepal total data
 *
 * @param   {CheerioSelector}  $
 *
 * @return  {Object}     Overview data
 */
const parseOverviewData = ($) => {
  const labels = ['confirmed', 'active', 'deaths', 'recovered', 'readmitted'];
  const numbers = $('span.nepal-total > div > span');
  const overview = {};
  numbers.each((index, elem) => {
    overview[labels[index]] = $(elem).text();
  });
  return overview;
};

/**
 * Scrapes Kathmandu Post site and adds data to its respective CSV files
 */
const kathmanduPostData = async () => {
  try {
    const $ = cheerio.load(
      (await axios.get('https://kathmandupost.com/covid19')).data,
    );
    const overviewData = parseOverviewData($);
    const districtData = parseDistrictData($);
    districtCsv.appendDataToCsv(districtData);
    overviewCsv.appendDataToCsv(overviewData);
  } catch (err) {
    logger.err('Error: Requesting Kathmandu Post Data failed!', err);
  }
};

module.exports = kathmanduPostData;
