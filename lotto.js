const fs = require('fs');

const moment = require('moment');
const cron = require('node-cron');

const {fetchEuroJackNumbers,
  fetchLottoNumbers,
  fetchResults,
  EURO,
  LOTTO } = require('./fetchNumbers');

var lastFriday = moment().day(moment().day() >= 5 ? 5 : -2);
var lastSaturday = moment().day(moment().day() >= 6 ? 6 : -1);
var lastWednesday = moment().day(moment().day() >= 3 ? 3 : -4);

var startCron = () => {
  // Schedule lotto fetch operations
  cron.schedule('0 22 * * Wed', () => {
    fetchLottoNumbers(lastWednesday, (err, numbers, superNumbers) => {
      if (err) {
        // handle error:
        console.log(err);
      }
      console.log(numbers);
      fs.appendFile('log', 'LottoNumbers Wednesday: ' + numbers.join(','), () => {
        console.log('log written');
      });
    });
  });

  cron.schedule('0 19 * * Thu', () => {
    // Every Thursday afternoon get lotto results
    fetchResults(LOTTO, lastWednesday, (err, results) => {
      if (err) {
        // handle error:
        console.log(err);
      }
      console.log(results);
      fs.appendFile('log', 'LottoQuoten Wednesday: ' + results.join(','), () => {
        console.log('log written');
      });
    });
  });

  cron.schedule('0 23 * * Fri', () => {
    // Every Friday evening, get eurojackpot numbers
    fetchEuroJackNumbers(lastFriday, (err, numbers, superNumbers) => {
      if (err) {
        // handle error:
        console.log(err);
      }
      console.log(numbers);
      fs.appendFile('log', 'EuroNumbers Wednesday: ' + numbers.join(','), () => {
        console.log('log written');
      });
    });
  });

  cron.schedule('55 23 * * Sat', () => {
    // Every Saturday night, get eurojackpot results and lotto numbers
    fetchLottoNumbers(lastSaturday, (err, numbers, superNumbers) => {
      if (err) {
        // handle error:
        console.log(err);
      }
      console.log(numbers);
      fs.appendFile('log', 'LottoNumbers Saturday: ' + numbers.join(','), () => {
        console.log('log written');
      });
    });
    fetchResults(EURO, lastFriday, (err, results) => {
      if (err) {
        // handle error:
        console.log(err);
      }
      console.log(results);
      fs.appendFile('log', 'EuroResults Friday: ' + results.join(','), () => {
        console.log('log written');
      });
    });
  });

  cron.schedule('0 19 * * Mon', () => {
    // Every Monday afternoon, get lott results
    fetchResults(LOTTO, lastSaturday, (err, results) => {
      if (err) {
        // handle error:
        console.log(err);
      }
      console.log(results);
      fs.appendFile('log', 'LottoResults Saturday: ' + results.join(','), () => {
        console.log('log written');
      });
    });
  });
};

module.exports = {startCron};
