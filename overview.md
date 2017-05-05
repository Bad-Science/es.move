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

