# Composing modules

Continuing from the [quick start guide](./quick-start.md), we will talk about
how to compose modules to create larger applications. The fully functional
version of the code in this chapter can be found in the `examples` folder.

## MVU vs components

Before we discuss the topic of composing modules, we need to address the
elephant in the room. Given the popularity of components in modern web
development, most people will assume that MVU modules are the same thing.
Components are just one way of organizing code. MVU does not use this way of
organizing code.

In MVU, the model, update, and view are completely independent layers that
happen to be in a single file. They do not have to be. And there is no rule that
you must have only one of each in each module. You can have a module that only
has the view layer, and has 20 view functions. You could have a module that only
performs the updates, but does not supply its own model and view. There is
complete freedom in how you organize your code as long as you keep these three
layers distinct.

## 3-digit counter example

To illustrate this point, let's create a simple three-digit counter app. The
three-digit counter has a widget that represents a single digit that can go from
0 to 9. The app displays three such digits and also the number represented by
these digits separately.

Let's create the widget module first.

```javascript
// counter.js

import { button, className, disabled, div, match, Msg, onClick, span, when } from 'movium'

let init = (n = 0) => n

let Inc = Msg.of()
let Dec = Msg.of()

let update = (msg, model) => match(msg,
  when(Inc, () => Math.min(9, model + 1)),
  when(Dec, () => Math.max(0, model - 1)),
)

let view = model => (
  div([className('counter')],
    button([className('counter-inc'), disabled(model === 9), onClick(Inc)], '+'),
    span([className('counter-num')], model),
    button([className('counter-dec'), disabled(model === 0), onClick(Dec)], '-'),
  )
)

export { init, update, view }
```

Among other things, you may notice that we are using a number for the model.
Models do not have to be objects, in other words.

The update function has two messages, Inc and Dec. Predictably, it increments
and decrements the model when these messages are received.

Finally, the view renders two buttons that correspond to the two actions, and
also shows the value of the model. The `disabled()` function takes a value and
sets the `disabled` property to true or false based on the value. We want to
disable the buttons as soon as they reach the respective extremes.

Let's create the app module now.

```javascript
// app.js

import { button, className, div, li, match, Msg, onClick, p, scope, ul, when } from 'movium'
import './app.css'
import * as counter from './counter'

let init = (n = 0) => ({
  n100: counter.init(Math.floor(n / 100)),
  n10: counter.init(Math.floor(n % 100 / 10)),
  n1: counter.init(n % 100 % 10),
  initialValue: n,
})

let InCounter = Msg.of()
let Reset = Msg.of()

let update = (msg, model) => match(msg,
  when(Reset, () => init(model.initialValue)),
  when(InCounter, ({ key, msg }) => 
    patch([key, Call.val(x => counter.update(msg, x))], model)
  ),
)

let num = model =>
  model.n100 * 100 +
  model.n10 * 10 +
  model.n1

let scopedCounter = (model, key) => (
  li([className('counter-digit')],
    scope(
      msg => InCounter.val({ key, msg }),
      counter.view(model),
    ),
  )
)

let view = model => (
  div([className('app')],
    p([className('display')], 'your number is: ', num(model)),
    ul([className('counter-list')],
      scopedCounter(model.n100, 'n100'),
      scopedCounter(model.n10, 'n10'),
      scopedCounter(model.n1, 'n1'),
    ),
    p([],
      button([onClick(Reset)], 'Reset')
    )
  )
)

export { init, update, view }
```

First thing that immediately stands out is that the `counter` module is used
simply as a library of functions inside the `app` module. Each layer in the
`app` module uses the matching layer of the `counter` module in its own way to
integrate the counters. This is what we mean when we say that a module is not a
component.

The model of the `app` module is initialized as so:

```javascript
let init = () => ({
  n100: counter.init(),
  n10: counter.init(),
  n1: counter.init(),
})
```

We have three instances of the counter model, each assigned to a unique key.

There is no such thing as local state in modules. Modules are stateless
(unless you deliberately use a mutable global object somewhere, that is) and all
state is created and managed by the framework. Because of that, the modules,
unlike components, do not encapsulate state. All application state must be
initialized in the top-level (root) model and updated by the top-level (root)
update function.

The update function only has one message, `InCounter`, which we used to delegate
messages to the counter's update function.

```javascript
let update = (msg, model) => match(msg,
  when(InCounter, ({ key, msg }) => 
    patch([key, Call.val(x => counter.update(msg, x))], model)
  ),
)
```

When the update function receives the `InCounter` message, it will need the key
to determine which of the three counters we are updating, and also the message
that the counter's view emitted. Thus, such information is stored in
the `InCounter` message.

Movium provides a `scope()` function to deal with scoped views. This function
takes two arguments: a message prototype, or a function that returns a message
object as the first, and a renderer function (function returned by an element
function or a view). Scoped views will wrap any and all incoming messages in the
specified prototype, or using the specified wrapper function, so that the
updater can identify them in some way.

```javascript
let scopedCounter = (model, key) => (
  li([],
    scope(
      msg => InCounter.val({ key, msg }), 
      counter.view(model)
    )
  )
)
```

The scoped counter view in this example will take any messages coming from the
counter (i.e., `Inc` and `Dec`) and create a `InCounter` message that contains
the original message as well as the counter's key.

**NOTE:** The `val()` method on the message object is provided by the `Msg`
prototype, so you have to create the message prototype using `Msg.of()` in order
to have it on your messages. If you would like to use plain objects for
messages, then you should use `val(InCounter, {key, msg})` instead.

Lastly, we render the app:

```javascript
// index.js

import { render } from 'movium'
import * as main from './app'

let root = document.querySelector('#app')
render(root, main.init, main.update, main.view)
```

## Initializing the application state

Let's say we want to initialize the counters at a specific value.

First we modify the counter's `init()` function to take the initial value as a
parameter:

```javascript
// counter.js

let init = (n = 0) => n
```

Next we add a parameter to the application's `init()` function:

```javascript
// app.js

let init = (n = 0) => ({
  n100: counter.init(Math.floor(n / 100)),
  n10: counter.init(Math.floor(n % 100 / 10)),
  n1: counter.init(n % 100 % 10),
})
```

Since `render()` will always call `init()` without arguments, we have to either
bind the desired initial value, or wrap it in a function:

```javascript
// index.js

render(root, () => main.init(32), main.update, main.view)
```

## Adding a reset button

Let's say we want to add a button that resets the state. When resetting state,
we want to reset to the initial value, so we need to remember the initial value
somewhere. The best place for that is the model.

```javascript
// app.js

let init = (n = 0) => ({
  n100: counter.init(Math.floor(n / 100)),
  n10: counter.init(Math.floor(n % 100 / 10)),
  n1: counter.init(n % 100 % 10),
  initialValue: n,
})
```

Next we need to add a `Reset` message, and use it in our update function.

```javascript
// app.js

let update = (msg, model) => match(msg,
  when(Reset, () => init(model.initialValue)),
  when(InCounter, ({ key, msg }) => ({
      ...model,
      [key]: counter.update(msg, model[key]),
    }),
  ),
)
```

We use the `init()` function as it does everything we need to get back to the
initial state.

Lastly, we need to add a button to trigger the reset.

```javascript
import { button, onClick } from 'movium'

let view = model => (
  div([],
    p([], 'your number is: ', num(model)),
    ul([],
      scopedCounter(model.n100, 'n100'),
      scopedCounter(model.n10, 'n10'),
      scopedCounter(model.n1, 'n1'),
    ),
    p([], button([onClick(Reset)])),
  )
)
```

## Key takeaways

Movium applications are organized in a tree-like structure where we have a root
model, root update, and root view (these are passed to the `render()`
function). The root function will import and use functions from the other
modules in order to build the totality of the application's state and views.

Messages emitted from a leaf components trickle up to the root where the root
updater then trickles the updates back down to the leaf.

## Next step

For patterns involving asynchronous operations, see
[Async tasks](./async-tasks.md).

## See also

- [Extending Movium](./extending-movium.md)
