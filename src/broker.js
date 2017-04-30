import io from 'socket.io-client';

export class Broker {
  constructor (url) {
    this.url = url;
    // this.socket = io(this.url);
  }

  connect (name, setId, receive) {
    this._socket = io(this.url, { query: `name=${name}` });
    this._socket.on('assignId', (id) => {
      setId(id);
      this._socket.on('receiveAction', receive);
    });
  }

  move (locator, action) {
    this._socket.emit('moveAction', locator, action);
  }
}
