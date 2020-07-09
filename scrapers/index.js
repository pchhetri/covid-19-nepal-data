const mohpData = require('./mohp');
const kathmanduPostData = require('./kathmandu-post');

/**
 * Begins scraping sites and add the data to respective CSV files
 */
const scrape = async () => {
  await mohpData();
  await kathmanduPostData();
};

scrape();
