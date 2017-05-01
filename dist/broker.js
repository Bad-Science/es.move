'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Broker = function () {
  function Broker(url) {
    _classCallCheck(this, Broker);

    this.url = url;
    // this.socket = io(this.url);
  }

  _createClass(Broker, [{
    key: 'connect',
    value: function connect(name, setId, receive) {
      var _this = this;

      console.log('BROKER-CLIENT: Attempting to connect and register ' + name);
      this._socket = (0, _socket2.default)(this.url, { query: 'name=' + name });
      this._socket.on('connect', function () {
        console.log('BROKER-CLIENT: Connected to broker service!');
      });
      this._socket.on('assignId', function (id) {
        console.log('BROKER-CLIENT: Registered with id: ' + id);
        setId(id);
        _this._socket.on('receiveAction', receive);
        _this._socket.on('receiveWithReply', receive);
      });
    }
  }, {
    key: 'move',
    value: function move(locator, action) {
      console.log('BROKER-CLIENT: Moving ' + action + ' to ' + locator);
      this._socket.emit('moveAction', locator, action);
    }
  }, {
    key: 'moveWithReply',
    value: function moveWithReply(locator, action) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2._socket.emit('moveWithReply', locator, action, function (response) {
          resolve(response);
        });
      });
    }
  }]);

  return Broker;
}();

exports.default = Broker;