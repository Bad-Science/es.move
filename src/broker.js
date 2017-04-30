import io from 'socket.io-client';

export default class Broker {
  constructor (url) {
    this.url = url;
    // this.socket = io(this.url);
  }

  connect (name, setId, receive) {
    console.log(`BROKER-CLIENT: Attempting to connect and register ${name}`);
    this._socket = io(this.url, { query: `name=${name}` });
    this._socket.on('connect', function () {
      console.log('BROKER-CLIENT: Connected to broker service!');
    });
    this._socket.on('assignId', (id) => {
      console.log(`BROKER-CLIENT: Registered with id: ${id}`);
      setId(id);
      this._socket.on('receiveAction', receive);
    });
  }

  move (locator, action) {
    console.log(`BROKER-CLIENT: Moving ${action} to ${locator}`);
    this._socket.emit('moveAction', locator, action);
  }

  moveWithReply (locator, action) {
    return new Promise ((resolve, reject) => {
      this._socket.emit('moveWithReply', locator, action, function (response) {
        resolve(response);
      });
    });
  }
}
