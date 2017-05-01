import Broker from './broker';
import Environment from './environment';

const broker = new Broker('http://localhost:3000');
const environment = new Environment('shows', broker);

environment.registerService('shows', {
  myFavoriteShow: () => {
    return 'Lost';
  }
});

let goToMovies = function () {
  // console.log(this.$.shows.myFavoriteShow());
  this.move('movies', function () {
    console.log(`Hello from ${this.params.originId} at ${this.envId}. Favorite Movie: ${this.$.movies.myFavoriteMovie()}`);
  }, { originId: this.envId });
};

let goToMoviesAndComeBack = function () {
  this.moveAnd('movies', function () {
    console.log('Yay Im at the movies!');
    return this.$.movies.myFavoriteMovie();
  }).then((val) => {
    console.log(`And now I'm back at the show! My favorite movie was ${val}}`);
  }).then(() => {
    this.move('movies', function () {
      console.log('Back to the movies!');
    });
  });
};

let thereAndBack = function () {
  this.move('movies', function () {
    console.log('Yay Im at the movies!');
    let favMovie = this.$.movies.myFavoriteMovie();
    this.move('shows', function () {
      console.log(`And Im back at the show! My Favorite movie was ${this.params.favMovie}`);
    }, { favMovie });
  });
};

environment.connect(function () {
  // environment.invoke(goToMovies);

  environment.invoke(goToMoviesAndComeBack);
});


