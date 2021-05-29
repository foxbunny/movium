# Movium

Movium is an implementation of the MVU architecture (a.k.a.
[Elm architecture](https://guide.elm-lang.org/architecture/)) in JavaScript.
This package provides the base framework built on top of
[Snabbdom](https://github.com/snabbdom/snabbdom) as well a few helper functions.

This framework is currently in an experimental phase, and the API may change
from time to time. Do not expect a stable release until version `1.0.0`.

## Key features

- MVU architecture
- Custom types and type-based pattern matching
- Integrated HTTP request functions
- Support for both class-based and style-based transitions
- Support for binding to document events as well as events outside the node
- Easily extensible at multiple levels
- Able to continue running after an uncaught exception

## Quick example

```javascript
import { match, when, id, div, input, onInput, value, p, render } from 'movium'

// MODEL

let init = () => 'hello'

// UPDATE

let SetName = {}

let update = (msg, model) => match(msg,
  when(SetName, id),
)

// VIEW

let view = model => (
  div([],
    p([], `Hello, ${model}`),
    p([],
      input([onInput(SetName), value(model)]),
    ),
  )
)

// Render the example

render(document.querySelector('#app'), init, update, view)
```

## Installation

TODO

## Documentation

### Library functions

This section provides an in-depth coverage of various functions that Movium 
provides. If you want a breadth-first coverage, see the application 
development guides.

- [Framework functions](./docs/library/framework-functions.md)
- [HTML](./docs/library/html.md)
- [HTTP](./docs/library/http.md)
- [Snabbdom modules](./docs/library/snabbdom-modules.md)
- [Types](./docs/library/types.md)
- [Pattern matching](./docs/library/pattern-matching.md)
- [Tools](./docs/library/tools.md)

### Application development guides

This section provides a broad overview of how to write Movium applications. 
If you want a more in-dept look at particular features, look at the library 
functions section.

- [Quick start](./docs/guides/quick-start.md)
- [Composing modules](./docs/guides/composing-modules.md)
- [Async tasks](./docs/guides/async-tasks.md)
- [Extending Movium](./docs/guides/extending-movium.md)

### Example code

The `examples` directory contains a handful of example apps that demonstrate 
concepts discussed in the documentation as well as one or two that are not. 

To start the example apps, clone this repository to a machine that has 
[NodeJS](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/), and run 
the following commands:

```javascript
yarn install
yarn examples:start
```

The visit `http://localhost:8080` in your browser to see the access the page 
with a list of examples.

