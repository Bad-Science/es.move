# es.move - A Framework For Writing Distributed Javascript Applications Using Mobile Agents


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


# Abstract
# Overview

Proposed is a framework for defining, dispatching and orchestrating mobile agents intended for constructing service oriented web applications. The aim of this project is to test the practicality of mobile agents in the context of ‘typical’ modern web applications. Included in the framework will be semantics for defining these mobile agents, and sequencing and joining their actions. The framework will also provide for defining environments, injecting services, and moving agents across environments in several ways.

# Agents

Agents are mobile actors capable of autonomously moving between environments. An agent may perform many actions both sequenced and in parallel. Each action will request a certain environment, to which the agent must move before the action can execute. An agent may request to move to any instance of an environment, a specific instance of an environment, multiple specific instances of an environment, or all instances of an environment, When actions are execute in parallel or in multiple instances at once, the agent may move to and exist in multiple environments and instances simultaneously. A join continuation function will be provided, making it easy to synchronize concurrent actions. Each action of an agent may consist of arbitrary logic, but may only use the dependencies available in the current environment. It is yet to be decided if agents should keep a global state, or should only use the return values and parameters of their actions as state.

# Environments

Environments are the containers in which agents carry out their behaviors. Each environment should have a unique, human readable name by which it can be identified. One of more instances of a particular environment may exist, making scaling trivial. Each instance of a service will be assigned a unique identifier as well.

Environments contain one or many services, which are available to local agents via dependency injection. Examples of environments include database servers, file servers, web pages, logging systems, mailers, webhook providers, etc.

# Services

Services are APIs that are exposed to Agents. Examples of services include but are by no means limited to an interface to a database, a filesystem, an external HTTP or Websocket API, or DOM or state of a web page. One or many services may be implemented by an environment and injected into agents the environment is hosting. Services should be written to be highly cohesive and modular. Services will have the capability of dispatching new agents. Services can be implemented as standard classes or functions.

# Middleware & Mobility

A middleware is needed to coordinate the movement of agents across environments. The middleware’s primary responsibility is move agents to the correct environment when a movement is requested. The middleware will direct agents to specific instances to an environment when requested, and will provide some form of load balancing otherwise. This movement and coordination will likely be implemented by Websocket connections between the middleware and each environment.

The middleware will also be responsible for preventing malicious behavior. Because sending code between environments may be dangerous, the middleware may either provide and enforce some form of code signing, or may instead provide mobility as abstracted remote procedure calls. Further research is needed to determine which approach should be used.

# Implementation & Language

The framework will be implemented in ECMAScript 6 (either Javascript or Typescript), possibly using the more advanced asynchronous features of ECMAScript 7 as well. It will be packaged as a library, allowing it to be used in any ES6 development and build environment. There are two primary advantages of using ES6: 1) it is the most popular language for building software for the Web today and 2) it runs in the browser (after transpilation). This is very important as it will allow a web page to act just as any other environment. A web page environment may inject as an agent dependency some interface to the DOM or some state manager, allowing an agent dispatched from the same or another location to make changes to the page and/or state based on some data or event. This may be particularly powerful for constructing dynamic web pages that need to access data from many sources and are involved in many asynchronous and synchronous events.

