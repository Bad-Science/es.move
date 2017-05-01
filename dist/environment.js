'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mobility = require('./mobility');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Environment = function () {
  function Environment(name, broker) {
    _classCallCheck(this, Environment);

    this._name = name;
    this._broker = broker;
    this._services = {};
  }

  _createClass(Environment, [{
    key: 'connect',
    value: function connect(callback) {
      var _this = this;

      console.log('Connecting to broker...');
      this._broker.connect(this._name, function (id) {
        _this._id = id;
        callback();
      }, function (a, cb) {
        _this.receive(a, cb);
      });
    }
  }, {
    key: 'registerService',
    value: function registerService(name, service) {
      this._services[name] = service;
    }
  }, {
    key: 'getContext',
    value: function getContext(params) {
      var _this2 = this;

      return {
        $: this._services,
        envId: this._id,
        params: params,
        move: function move() {
          _this2.move.apply(_this2, arguments);
        },
        moveAnd: this.moveAnd.bind(this),
        join: function join() {
          return Promise.all.apply(Promise, arguments);
        }
      };
    }
  }, {
    key: 'invoke',
    value: function invoke(action, params) {
      var theAction = action.bind(this.getContext(params));
      // console.log(theAction.toString());
      return theAction();
    }
  }, {
    key: 'receive',
    value: function receive(serializedAction, callback) {
      var deserializedAction = (0, _mobility.deserializeAction)(serializedAction);
      // console.log(`receive: ${this}`);
      var actionResult = this.invoke(deserializedAction.action, deserializedAction.params)();
      // console.log(`result: ${actionResult}`)
      if (typeof callback === 'function') {
        callback(actionResult);
      }
    }
  }, {
    key: 'receiveAnd',
    value: function receiveAnd(serializedAction, callback) {
      var deserializedAction = (0, _mobility.deserializeAction)(serializedAction);
      this.invoke(deserializedAction.action, deserializedAction.params);
    }
  }, {
    key: 'move',
    value: function move(locator, action, params) {
      // console.log(`PARAMS$$$$$: ${Object.keys(params)} ${Object.values(params)}`);
      var serializedAction = (0, _mobility.serializeAction)(action, params);
      // console.log(`moveing: ${serializedAction}`);
      this._broker.move(locator, serializedAction);
    }
  }, {
    key: 'moveAnd',
    value: function moveAnd(locator, action, params) {
      var serializedAction = (0, _mobility.serializeAction)(action, params);
      return this._broker.moveWithReply(locator, serializedAction);
    }
  }]);

  return Environment;
}();

exports.default = Environment;