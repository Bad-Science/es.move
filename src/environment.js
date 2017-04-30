import { move, serializeAction, deserializeAction } from './mobility';

export default class Environment {
  constructor (name, broker) {
    this._name = name;
    this._broker = broker;
    this._services = {};
  }

  connect () {
    console.log('Connecting to broker...');
    this._broker.connect(
      this._name,
      (id) => { this._id = id; },
      (a) => { this.receive(a); }
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
      move: (...args) => { this.move(...args); }
    }
  }

  invoke (action, params) {
    action.bind(this.getContext(params))();
  }

  receive (serializedAction) {
    const deserializedAction = deserializeAction(serializedAction);
    console.log(`receive: ${this}`);
    this.invoke(deserializedAction.action, deserializedAction.params);
  }

  move (locator, action, params) {
    const serializedAction = serializeAction(action, params);
    console.log(`move: ${this}`);
    this._broker.move(locator, serializedAction);
  }
}
