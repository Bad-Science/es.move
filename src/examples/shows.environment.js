import { Broker, Environment } from '../es.move';

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
  this.away('movies', function () {
    console.log('Yay Im at the movies!');
    // return this.away('stage', function () {
    //   console.log(this.params.testParam);
    // }, { testParam: 'hellStage' });
    return this.$.movies.myFavoriteMovie();
  }).then((val) => {
    console.log(`And now I'm back at the show! My favorite movie was ${val}}`);
    return this.away('movies', function () {
      console.log(`Seeing ${this.$.movies.myFavoriteMovie()} again!!!`);
      return 'yayayayayaya';
    })
  }).then((val) => {
    this.move('movies', function () {
      console.log(`Back to the movies! // ${this.params.val}`);
    }, { val });
  });
};

let getARandomNumber = function (number) {
  return this.away('movies', function () {
    let randomNumber = Math.random() * this.params.number;
    console.log(randomNumber);
    // for (let i = Date.now(); Date.now() < i + 5000;);
    // let favShow = await this.away('shows', function () {
    //   return this.$.shows.myFavoriteShow();
    // })
    return { number: this.params.number, randomNumber };
  }, { number });
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

environment.connect(function (run) {
  // environment.invoke(goToMovies);

  environment.run(goToMoviesAndComeBack);
  
  environment.run(async function () {
    // Promise.all([0, 1, 2, 3, 4, 5].map(getARandomNumber.bind(this))).then((tokens) => {
    //   console.log(tokens);
    // });
    // let inputs = [100000, 20, 80, 15, 30, 9];
    // let agents = inputs.map(getARandomNumber.bind(this));
    // let results = await this.join(agents);
    // console.log(results);
  });
});
