import Broker from './broker';

function serializer (key, value) {  
  if (typeof value === 'function') {    
    return value.toString();  
  }   
  return value;
}

function deserializer (key, value) {  
  if (typeof value === 'string' && value.indexOf('function ') === 0) {   
    try { 
      let functionTemplate = `(${value})`;    
      return new Function(functionTemplate); 
    } catch (e) {
      return value;
    }
  }  
  return value;
}


export function serializeAction (action, params) {
  return JSON.stringify({ action: action, params: params }, serializer);
}

export function deserializeAction (data) {
  return JSON.parse(data, deserializer);
}

export function move (locator, action) {

}