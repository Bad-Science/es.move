'use strict';

var _broker = require('./broker');

var _broker2 = _interopRequireDefault(_broker);

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var broker = new _broker2.default('http://localhost:3000');
var environment = new _environment2.default('shows', broker);

environment.registerService('shows', {
  myFavoriteShow: function myFavoriteShow() {
    return 'Lost';
  }
});

var goToMovies = function goToMovies() {
  // console.log(this.$.shows.myFavoriteShow());
  this.move('movies', function () {
    console.log('Hello from ' + this.params.originId + ' at ' + this.envId + '. Favorite Movie: ' + this.$.movies.myFavoriteMovie());
  }, { originId: this.envId });
};

var goToMoviesAndComeBack = function goToMoviesAndComeBack() {
  var _this = this;

  this.moveAnd('movies', function () {
    console.log('Yay Im at the movies!');
    return this.$.movies.myFavoriteMovie();
  }).then(function (val) {
    console.log('And now I\'m back at the show! My favorite movie was ' + val + '}');
    return _this.moveAnd('movies', function () {
      console.log('Seeing ' + this.$.movies.myFavoriteMovie() + ' again!!!');
    });
  }).then(function () {
    _this.move('movies', function () {
      console.log('Back to the movies!');
    });
  });
};

var getARandomNumber = function getARandomNumber(number) {
  return this.moveAnd('movies', function () {
    var randomNumber = Math.random() * this.params.number;
    console.log(randomNumber);
    // for (let i = Date.now(); Date.now() < i + 5000;);
    // let favShow = await this.moveAnd('shows', function () {
    //   return this.$.shows.myFavoriteShow();
    // })
    return { number: this.params.number, randomNumber: randomNumber };
  }, { number: number });
};

var thereAndBack = function thereAndBack() {
  this.move('movies', function () {
    console.log('Yay Im at the movies!');
    var favMovie = this.$.movies.myFavoriteMovie();
    this.move('shows', function () {
      console.log('And Im back at the show! My Favorite movie was ' + this.params.favMovie);
    }, { favMovie: favMovie });
  });
};

environment.connect(function () {
  // environment.invoke(goToMovies);

  environment.invoke(goToMoviesAndComeBack);

  environment.invoke(_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
});