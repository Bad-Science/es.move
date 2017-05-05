# es.move - A Framework For Writing Distributed Javascript Applications Using Mobile Agents

## Overview 
es.move is a framework for defining, dispatching and orchestrating mobile agents intended for constructing service oriented web applications. The aim of this project is to test the practicality of mobile agents in the context of ‘typical’ modern web applications. es.move provides semantics for creating mobile agents, defining execution environments and services, and moving agents across environments autonomously in several ways.

### Agents

Agents are mobile functions capable of autonomously moving between environments. Agents in es.move are defined as compositions of functions. Each agent has access to three mobile primitives, `move`, `away`, and `join`. An agent may use the move primitive to permanently relocate to a new environment and continue as a provided function. The `away` primitive may be used to temporarily move an actor to a new environment, perform a function, and return with a value and continue performing in the origin context. This is useful for retrieving some information from an environment, or distributing work across many environments. The `join` primitive is a native, non-blocking join continuation to be used with two or more `away` actions. `away` and `join` are implemented using native promises, making them asynchronous, easy to program and reason about. `move` and `away` actions may be nested to execute in sequence, or places at the same scope to execute in parallel. In the latter case, a single agent may spawn multiple ‘copies’ which may execute in different environments simultaneously. The destination environment is specified by a locator, which has three modes. A locator can indicate that an agent should move to a particular instance of an environment, to any available instance of an environment, or to all instances of an environment. Agents are considered to be stateless, and `move` and `away` functions may be given arbitrary parameters in order to pass information between environments. Future work will refine these primitives and their usage to be as expressive, easy to program and easy to reason about as possible.

### Environments

Environments are the containers in which agents carry out their behaviors. Each environment has a unique, human readable name by which it can be identified. One of more instances of a particular environment may exist, making scaling trivial. Each instance of an environment is  assigned a unique id by which it can be located.

Environments contain one or many services, which are available to local agents via dependency injection. Examples of environments include database servers, file servers, web pages, logging systems, mailers, webhook providers, etc.

Environments can receive serialized agents, which they will deserialize and execute. Before an agent is executed, the environment binds the agent’s function to a new scope containing the mobility primitive functions, some information about the environment, and any services the environment should expose.

### Services

Services are objects or APIs that are exposed to Agents. Examples of services include but are by no means limited to an interface to a database, a filesystem, an external HTTP or Websocket API, or DOM or state of a web page. One or many services may be implemented by an environment and injected into agents the environment is hosting. Services should be written to be highly cohesive and modular. Services have the capability of dispatching new agents. Services can be implemented as objects, classes or functions.

### Middleware & Mobility

A middleware is currently needed to coordinate the movement of agents across environments. This middleware is currently implemented as a Broker server. The broker receives requests to move serialized agents to a certain locator, and forwards the agent to the correct environment. Every environment is connected to the broker by a Websocket connection. Requests to the broker and to other environments are buffered so they are not lost if an environment or the broker is unavailable. 

Eventually, the middleware will also be responsible for preventing malicious behavior. Because sending code between environments may be dangerous, the middleware may either provide and enforce some form of code signing, or may instead provide mobility as abstracted remote procedure calls. Further research is needed to determine which approach should be used. The middleware may also eventually be decentralized, or replaced with a simple name server, although the implications of having environments communicate directly have yet to be explored.

### Implementation

The framework is implemented in ECMAScript 6 (Javascript). The environment framework is packaged as a library and published on the NPM registry, allowing it to be used in any ES6 development and build environment. There are two primary advantages of using ES6: 1) it is one of the most popular languages for building software for the Web today and 2) it runs in the browser. One of the greatest challenges of mobile agent system is the need for a common execution environment, and the Javascript environment is one of the most ubiquitous available. It is also a very easy language to learn and program in and has a very large developer community, which is vital for usefulness and adoption.

Additionally, this will allow a web page to act just as any other environment. A web page environment may inject as an agent dependency some interface to the DOM or some state manager, allowing an agent dispatched from the same or another location to make changes to the page and/or state based on some data or event. This may be particularly powerful for constructing dynamic web pages that need to access data from many sources and are involved in many asynchronous and synchronous events. Some of the functionality may have to be heavily restricted in browser environments however to ensure the security of the system.

This is the first iteration of the framework, and the next iteration will focus on refining the mobility primitives and improving the middleware.

---

## Usage/API

### Creating an Environment

The simplest environment is the Stage, an environment with no services and no agents.

```js    
/* stage environment */
import { Broker, Environment } from 'es.move';
const environment = new Environment('stage', new Broker('http://localhost:4815'));

environment.connect(function () {
  /* I do nothing! :) */
});
```

Here we have a stage, ready to accept agents from other environments. Every instance of an environment is assigned a unique id.

### Creating an Agent

Environments aren’t particularly useful without Agents. Creating an agent is as simple as writing a function and calling `run()` .

```js
environment.connect(function () {
  environment.run(function () {
    let onePlusOne = 1 + 1;
    console.log(`One plus one equals ${onePlusOne}`);
  });
});
```

### Mobile Agents

Agents become interesting when they start moving. In addition to our stage, we can create another environment with a mobile agent. Agents can autonomously move between environments by calling `this.move(locator, action, params)` .

```js
/**/
import { Broker, Environment } from 'es.move';
const environment = new Environment('i_have_agents', new Broker('http://localhost:4815'));

environment.connect(function () {
  environment.run(function () {
    console.log("This will print where I start...");
    this.move('stage', function () {
      console.log("And this will print where I move to!");
    });
  });
});
```

The first parameter of `this.move()` is the location the agent should move to, and the second is how the agent should perform in its new environment.

### Moving with Data

Agents are stateless, and variables above the scope of the function passed to `move()` will not be available after the agent moves. This has the important side effect of agents only having access to the objects they are explicitly given. Any data an agent should take with it when it moves must be explicitly given to `this.move()` as a parameter. 

```js
environment.connect(function () {
  environment.run(function () {
    let message = 'Hello from i_have_agents!';
    this.move('stage', function () {
      console.log(this.params.message);
    }, { message });
  });
});
```

### Interacting With the Environment

Environments can expose external objects to agents by dependency injection. Dependencies are called Services, and are automatically injected into any agent running in the environment. Services can be added by calling `registerService(name, service)`.

```js
const environment = new Environment('my_data', new Broker('http://localhost:4815'));

environment.registerService('myDataService', {
  getMyData: () => {
    return 'Some Data';
  }
});

environment.connect();
```

Any agent running in a `my_data` environment can now access the `myDataService` service. Services are exposed through the property `this.$`.

```js
const environment = new Environment('no_data_here', new Broker('http://localhost:4815'));

environment.connect(function () {
  environment.run(function () {
    this.move('my_data', function () {
      console.log(this.$.myDataService.getMyData()); // prints 'Some Data' at the my_data environment
    });
  });
});
```

### Moving Data Between Environments

We can amend our `no_data_here` environment to include a data store service, and then populate that data store with data from the `my_data` environment. We can pass the locator of the starting environment as a parameter to ensure the agent returns to the same instance at which it started.

```js
const environment = new Environment('i_store_data', new Broker('http://localhost:4815'));

let dummyDataStore = new Map()
environment.registerService('dataStore', dummyDataStore);

environment.connect(function () {
  environment.run(function () {
    this.move('my_data', function () {
      let someData = this.$.myDataService.getMyData();
        this.move(this.params.origin, function () {
          this.$.dataStore.set('myData', someData);
          console.log(this.$.dataStore.get('show'));
        }, { someData });
    }, { origin: this.envLocator });
  });
});
```

Our dummy data store could easily be replaced with a shared key-value store e.g., redis. This is however a bit verbose, so a convenient abstraction is provided for moving to an environment and returning with a value. `this.away()` moves an agent to an environment, then resumes execution in the origin environment when it is finished executing. `this.away()` returns a native Promise that resolves with the return value of the away agent.

```js
environment.run(function () {
  this.away('my_data', function () {
    return this.$.myDataService.getMyData();
  }).then((someData) => {
    console.log(someData); // prints someData in the origin environment
  });
});
```

### Concurrent Agents

An agent may call `move` or `away` multiple times in the same scope to perform tasks in multiple environments concurrently.

```js
this.away('my_data', function () {
  return this.$.myDataService.getMyData();
}).then((someData) => {
  console.log(someData); // prints someData in the origin environment
});
this.away('other_data', function () {
  return this.$.otherDataService.getOtherData();
}).then((otherData) => {
  console.log(otherData); // prints otherData in the origin environment
});
```

### Join Continuations

When performing actions concurrently, it is often necessary to then join these actions with a continuation. The framework provides a primitive `join`, which can join an arbitrary number of away actions. Because `away` returns a native promise, multiple `away` actions can easily be joined without blocking the thread using the native `Promise.all()`. `join` is implemented as a wrapper around this native function. The `join` promise resolves when all `away`s have returned with an array of the returned values.

```js
this.join(
  this.away('my_data', function () {
    return this.$.myDataService.getMyData();
  }),
  this.away('other_data', function () {
    return this.$.otherDataService.getOtherData();
  })
).then((values) => {
  console.log(values); // prints [ someData, otherData ]
});
```

`join` can also accept an array of `away` actions. This is very useful for dynamically distributing work across the available environments, and can be used to implement distributed algorithms. Unless an environment id is specified in the locator, the `away` agents will be distributed evenly amongst the available instances of the specified environment name.

```js
let randomArray = (length, max) => [...new Array(length)]
  .map(() => Math.round(Math.random() * max));

let getAverage = function (list) {
  return this.away('stage', function () {
    let sum = this.params.list.reduce((b, a) => a += b );
    return sum / this.params.list.length
  }, { list });
};

environment.connect(function () {
  environment.run(function () {
    let inputData = [100, 200, 50, 20].map((x) => randomArray(1000, x));
    let agents = inputData.map(getAverage.bind(this));
    this.join(agents).then((results) => {
      console.log(results);
    });
  });
});

```

## Examples

### 'Serverless' Chat Room

```js
const environment = new Environment('web_browser', new Broker('http://localhost:4815'));

let submitButton = document.querySelector('#submit');
let inputField = document.querySelector('#input');
let messageLog = document.querySelector('#messageLog');

environment.registerService('messageLog', messageLog);
environment.connect(function () {
  submitButton.onclick = function () {
    environment.run(function () {
      let message = inputField.text();
      this.move('web_browser:all', function () {
        this.$.messageLog.innerHTML += `<br>${message}`;
      }, { message });
    });
  };
});

```
