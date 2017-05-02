import Broker from './broker';

const BLACKLIST_OBJECTS = [
  'DTRACE_NET_SERVER_CONNECTION',
  'DTRACE_NET_STREAM_END',
  'DTRACE_HTTP_SERVER_REQUEST',
  'DTRACE_HTTP_SERVER_RESPONSE',
  'DTRACE_HTTP_CLIENT_REQUEST',
  'DTRACE_HTTP_CLIENT_RESPONSE',
  'global',
  'process',
  // 'Buffer',
  'clearImmediate',
  'clearInterval',
  'clearTimeout',
  'setImmediate',
  'setInterval',
  'setTimeout',
  // 'console',
  'module',
  'require'
];

const BLACKLIST_SCRIPT = `var ${BLACKLIST_OBJECTS.join('=')}=undefined;`;
// console.log(BLACKLIST_SCRIPT);

function serializer (key, value) {  
  if (typeof value === 'function') {    
    return value.toString();  
  }   
  return value;
}

function deserializer (key, value) {  
  if (typeof value === 'string' && value.indexOf('function ') === 0) {   
    try { 
      let functionTemplate = `return (${value}).bind(this)`;    
      // console.log(functionTemplate)
      return new Function(functionTemplate);
    } catch (e) {
      return value;
    }
  }  
  return value;
}


export function serializeAction (action, params) {
  // console.log(`Serializing: ${JSON.stringify({ action: action, params: params })}`);
  return JSON.stringify({ action: action, params: params }, serializer);
}

export function deserializeAction (data) {
  return JSON.parse(data, deserializer);
}

export function move (locator, action) {

}