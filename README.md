# Movium

Movium is an implementation of the MVU architecture (a.k.a.
[Elm architecture](https://guide.elm-lang.org/architecture/)) in JavaScript.
This package provides the base framework built on top of
[Snabbdom](https://github.com/snabbdom/snabbdom) as well a few helper functions.

This framework is currently in an experimental phase, and the API may change
from time to time. Do not expect a stable release until version `1.0.0`.

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

- [Quick start](./docs/quick-start.md)
- [Composing modules](./docs/composing-modules.md)
- [Async tasks](./docs/async-tasks.md)



