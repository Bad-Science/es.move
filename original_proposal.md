# DCI Project Proposal

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

