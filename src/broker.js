import io from 'socket.io-client';

export default class Broker {
  constructor (url) {
    this.url = url;
    // this.socket = io(this.url);
  }

  connect (name, setId, receive) {
    console.log(`BROKER: Attempting to connect and register ${name}`);
    this._socket = io(this.url, { query: `name=${name}` });
    this._socket.on('connect', function () {
      console.log('BROKER: Connected to broker service!');
    });
    this._socket.on('assignId', (id) => {
      console.log(`BROKER: Registered with id: ${id}`);
      setId(id);
      this._socket.on('receiveAction', receive);
    });
  }

  move (locator, action) {
    this._socket.emit('moveAction', locator, action);
  }
}
