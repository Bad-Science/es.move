import { Broker, Environment } from '../es.move';

const broker = new Broker('http://localhost:3000');
const environment = new Environment('movies', broker);

environment.registerService('movies', {
  myFavoriteMovie: () => {
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
