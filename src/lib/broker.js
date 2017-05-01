import io from 'socket.io-client';

export default class Broker {
  constructor (url) {
    this.url = url;
  }

  connect (name, setId, receive) {
    console.log(`BROKER-CLIENT: Attempting to connect and register ${name}`);
    this._socket = io(this.url, { query: `name=${name}` });
    this._socket.on('connect', function () {
      console.log('BROKER-CLIENT: Connected to broker service!');
    });
    this._socket.on('environment_register', (id) => {
      console.log(`BROKER-CLIENT: Registered with id: ${id}`);
      setId(id);
    });
    this._socket.on('agent_move', receive);
    this._socket.on('agent_away', receive);
  }

  move (locator, action) {
    // console.log(`BROKER-CLIENT: Moving ${action} to ${locator}`);
    this._socket.emit('agent_move', locator, action);
  }

  away (locator, action) {
    return new Promise ((resolve, reject) => {
      this._socket.emit('agent_away', locator, action, function (response) {
        resolve(response);
      });
    });
  }
}
