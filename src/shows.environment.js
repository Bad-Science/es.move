import Broker from './broker';
import Environment from './environment';

const broker = new Broker('http://localhost:3000');
const environment = new Environment('shows', broker);

environment.registerService('shows', {
  myFavoriteShow: () => {
    return 'Lost';
  }
});

environment.connect(function () {
  environment.invoke(function () {
    console.log(this.$.shows.myFavoriteShow());
    this.move('movies', function () {
      console.log(`Hello from ${this.params.originId} at ${this.envId}. Favorite Movie: ${this.$.movies.myFavoriteMovie()}`);
    }, { originId: this.envId });
  }, { message: 'Initial Message' });
});


