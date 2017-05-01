import { Broker, Environment } from '../es.move';

const broker = new Broker('http://localhost:4815');
const environment = new Environment('stage', broker);

environment.connect(function () {
  environment.run(function () {
    console.log(`Stage ${this.envId} ready for Agents!`);
  });
});
