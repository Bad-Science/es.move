'use strict';

var _broker = require('./broker');

var _broker2 = _interopRequireDefault(_broker);

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var broker = new _broker2.default('http://localhost:3000');
var environment = new _environment2.default('movies', broker);

environment.registerService('movies', {
  myFavoriteMovie: function myFavoriteMovie() {
    return 'Pulp Function';
  }
});

environment.connect(function () {
  // environment.invoke(function () {
  //   console.log(this.$.movies.myFavoriteMovie());
  //   this.move('movies', function () {
  //     console.log(this.params.message);
  //   }, { message: 'Final Message' });
  // }, { message: 'Initial Message' });
});