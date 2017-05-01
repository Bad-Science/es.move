'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializeAction = serializeAction;
exports.deserializeAction = deserializeAction;
exports.move = move;

var _broker = require('./broker');

var _broker2 = _interopRequireDefault(_broker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function serializer(key, value) {
  if (typeof value === 'function') {
    return value.toString();
  }
  return value;
}

function deserializer(key, value) {
  if (typeof value === 'string' && value.indexOf('function ') === 0) {
    try {
      var functionTemplate = 'return (' + value + ').bind(this)';
      // console.log(functionTemplate)
      return new Function(functionTemplate);
    } catch (e) {
      return value;
    }
  }
  return value;
}

function serializeAction(action, params) {
  // console.log(`Serializing: ${JSON.stringify({ action: action, params: params })}`);
  return JSON.stringify({ action: action, params: params }, serializer);
}

function deserializeAction(data) {
  return JSON.parse(data, deserializer);
}

function move(locator, action) {}