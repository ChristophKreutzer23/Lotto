var jsdom = require('jsdom');
var moment = require('moment');

// Badly faked enum:
var EURO = 1;
var LOTTO = 2;

var getTable = (type, date, callback) => {
  var mom = moment(date).format('DD.MM.YYYY');
  var qString;

  if (type === EURO) {
    qString = `https://www.lotto-thueringen.de/lottoth/de/portal/kanal/eurojackpot/zahlen_und_quoten/eurojack_zahlen_und_quoten_1.jsp?ziehungsDatum=${mom}`;
  } else if (type === LOTTO) {
    qString = `https://www.lotto-thueringen.de/lottoth/de/portal/kanal/lotto/lto_zahlen-und-quoten/lto_zahlen-und-quoten.jsp?ziehungsDatum=${mom}`;
  } else {
    callback('ERROR: Type of lotto undefined!');
  }

  jsdom.env(
    // Query this page
    qString,
    ['http://code.jquery.com/jquery.js'],
    (err, window) => {
      if (err) {
        return callback('Could not fetch document from lotto server');
      }
      // get instance of document
      var document = window.document;
      callback(undefined, document.querySelector('table.result'));
    }
  );
};

var getNumbers = (type, date, callback) => {
  var mom = moment(date).format('DD.MM.YYYY');
  var qString, qHeadline;

  if (type === EURO) {
    qString = `https://www.lotto-thueringen.de/lottoth/de/portal/kanal/eurojackpot/zahlen_und_quoten/eurojack_zahlen_und_quoten_1.jsp?ziehungsDatum=${mom}`;
    qHeadline = 'Eurojackpot Gewinnzahlen';
  } else if (type === LOTTO) {
    qString = `https://www.lotto-thueringen.de/lottoth/de/portal/kanal/lotto/lto_zahlen-und-quoten/lto_zahlen-und-quoten.jsp?ziehungsDatum=${mom}`;
    qHeadline = 'LOTTO Gewinnzahlen';
  } else {
    callback('ERROR: Type of lotto undefined!');
  }

  jsdom.env(
    // Query this page
    qString,
    ['http://code.jquery.com/jquery.js'],
    (err, window) => {
      if (err) {
        return callback('Could not fetch document from lotto server');
      }
      // get instance of document
      var document = window.document;
      // scan through all headlines to find the ones for the eurojackpot numbers
      for (var i = 0; i < document.querySelectorAll('span.headline').length; i++) {
        var headline = document.querySelectorAll('span.headline')[i];
        if (headline.innerHTML === qHeadline) {
          // if headline is the correct numbers, get parentNode and all the numbers
          callback(undefined, headline.parentNode.getElementsByClassName('lottonumber'));
        }
      }
    }
  );
};

var fetchEuroJackNumbers = (date, callback) => {
  getNumbers(EURO, date, (err, numbers) => {
    if (err) {
      return callback(err);
    }
    var nums = [];
    var superNums = [];
    // split the numbers into the regular and super numbers
    for (var j = 0; j < numbers.length; j++) {
      if (j < 5) {
        nums.push(numbers[j].innerHTML);
      } else {
        superNums.push(numbers[j].innerHTML);
      }
    }
    callback(undefined, nums, superNums);
  });
};

var fetchLottoNumbers = (date, callback) => {
  getNumbers(LOTTO, date, (err, numbers) => {
    if (err) {
      return callback(err);
    }
    var nums = [];
    var superNums = [];
    // split the numbers into the regular and super numbers
    for (var j = 0; j < numbers.length; j++) {
      if (j < 6) {
        nums.push(numbers[j].innerHTML);
      } else {
        superNums.push(numbers[j].innerHTML.toString().trim());
      }
    }
    callback(undefined, nums, superNums);
  });
};

var fetchResults = (type, date, callback) => {
  getTable(type, date, (err, table) => {
    if (err) {
      return callback(err);
    }
    var children = table.children[0].children;
    var result = {};
    for (var i = 1; i < children.length; i++) {
      var winnings = parseFloat(children[i].children[2].innerHTML
        .trim().replace(' EUR', '').replace(/\./g, '')
        .replace(',', '.'));
      var numberOfWinners = parseInt(children[i].children[1].innerHTML);
      result[i] = (winnings / numberOfWinners).toFixed(2);
    }
    callback(result, 'hallo');
  });
};

module.exports = {fetchEuroJackNumbers,
  fetchLottoNumbers,
  fetchResults,
  EURO,
  LOTTO
};
