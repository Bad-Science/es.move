import { move, serializeAction, deserializeAction } from './mobility';

export default class Environment {
  constructor (name, broker) {
    this._name = name;
    this._broker = broker;
    this._services = {};
  }

  connect (callback) {
    console.log('Connecting to broker...');
    this._broker.connect(
      this._name,
      (id) => { 
        this._id = id;
        callback();
       },
      (a, cb) => { this.receive(a, cb); }
    );
  }

  registerService (name, service) {
    this._services[name] = service;
  }

  getContext (params) {
    return {
      $: this._services,
      envId: this._id,
      params: params,
      move: (...args) => { this.move(...args); },
      moveAnd: this.moveAnd.bind(this),
      join: (...args) => { return Promise.all(...args); }
    }
  }

  invoke (action, params) {
    let theAction = action.bind(this.getContext(params))
    // console.log(theAction.toString());
    return theAction();
  }

  receive (serializedAction, callback) {
    const deserializedAction = deserializeAction(serializedAction);
    // console.log(`receive: ${this}`);
    const actionResult = this.invoke(deserializedAction.action, deserializedAction.params)();
    // console.log(`result: ${actionResult}`)
    if (typeof callback === 'function') {
      callback(actionResult);
    }
  }

  receiveAnd (serializedAction, callback) {
    const deserializedAction = deserializeAction(serializedAction);
    this.invoke(deserializedAction.action, deserializedAction.params)
  }

  move (locator, action, params) {
    // console.log(`PARAMS$$$$$: ${Object.keys(params)} ${Object.values(params)}`);
    const serializedAction = serializeAction(action, params);
    // console.log(`moveing: ${serializedAction}`);
    this._broker.move(locator, serializedAction);
  }

  moveAnd(locator, action, params) {
    const serializedAction = serializeAction(action, params);
    return this._broker.moveWithReply(locator, serializedAction);
  }
}
