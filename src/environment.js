import { move, serializeAction, deserializeAction } from 'mobility';

class Environment {
  constructor (name, broker) {
    this._name = name;
    this._broker = broker;
    this._services = {};
  }

  function connect () {
    broker.connect(
      this._name,
      (id) => {this._id = id},
      this.receive
    );
  }

  function registerService (name, service) {
    this._services[name] = service;
  }

  function getContext (params) {
    return {
      $: this._services,
      envId: this._id,
      params: params,
      move: this.move
    }
  }

  function invoke (action, params) {
    action.bind(this.getContext())();
  }

  function receive (serializedAction) {
    const deserializedAction = Mobility.deserializeAction(serializedAction);
    this.invoke(deserializedAction.action, deserializedAction.params);
  }

  function move (locator, action, params) {
    const serializedAction = serializeAction(action, params);
    this._broker.move(locator, serializedAction);
  }
}
