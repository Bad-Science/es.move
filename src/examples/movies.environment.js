import { Broker, Environment } from '../es.move';

const broker = new Broker('http://localhost:4815');
const environment = new Environment('movies', broker);

// class DataStore {
//   constructor () {
//     this.store = {};
//   }

//   setData (key, val) {
//     this.store[key] = val;
//   }

//   getData (key) {
//     return this.store[key];
//   }
// }

// dataStore = {
//   data: {},
//   getData: (key) => { return data[key] },

// }

environment.registerService('movies', {
  myFavoriteMovie: () => {
    return 'Pulp Function';
  }
});

environment.registerService('dataStore', new Map());

let x = 'hello';

environment.connect(function () {
  environment.run(function () {
    console.log(this.$.movies.myFavoriteMovie());
    // console.log(x);
    this.move('movies', function () {
      console.log(this.params.message);
    }, { message: 'Final Message' });
  }, { message: 'Initial Message' });
});
