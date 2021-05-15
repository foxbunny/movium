# Movium quick start

Here's a hello world example. A working version of the code discussed here can
be found in the `examples` folder.

```javascript
import { div, input, match, onInput, p, render, value, when } from 'movium'

// --( Model )------------------------------------------------------------------

let init = () => ({
  name: 'world',
})

// --( Update )-----------------------------------------------------------------

let SetName = {}

let update = (msg, model) => match(msg,
  when(SetName, name => ({ ...model, name })),
)

// --( View )-------------------------------------------------------------------

let view = model => (
  div([],
    p([],
      input([onInput(SetName), value(model.name)]),
    ),
    p([],
      `Hello, ${model.name}`,
    ),
  )
)

// --( Render )-----------------------------------------------------------------

let root = document.createElement('div')
document.body.appendChild(root)

render(root, init, update, view)
```

Movium apps are organized in modules. Each has one or more of the following
three parts:

- `init()` - function that creates the initial state of the module
- `view()` - function that takes the state and returns the interface elements
  matching the state
- `update()` - function that updates the state based on messages from the
  interface

This example is a single-module app. Most simple apps can be comfortably written
as single-module apps, too.

We customarily write the `update()` function right after the `init()`
function in our code because of the close relationship between these two
functions: it is easier when we can quickly reference the data structure while
we are working on the functions that update it. Thus, the order in the code is
MUV, but we call the pattern MVU because of the order in which data passes
through the application.

In the example program, the init function is this:

```javascript
let init = () => ({
  name: 'world'
})
```

Movium makes no assumptions about the model. It may be a complex object, an
instance of a class, or primitive types like strings, numbers, and booleans. In
this example, the model might as well have been a string as there is no other
information stored in it.

Next we declare messages we would like to use in our update function:

```javascript
let SetName = {}
```

A message is a plain empty object. As with the model, Movium does not care what
object it is, but it has to be an object, as it is used as a prototype for the
actual messages.

The update function takes two arguments, the message emitted by the view, and a
model, and returns a model.

```javascript
let update = (msg, model) => match(msg,
  when(SetName, name => ({ ...model, name })),
)
```

The `match()` function is a Movium-provided utility for performing pattern
mathcing. It takes a value as its... gulp... first argument (loud gasps from the
point-free crowd), and any number of matcher functions, and returns the result
of the first matcher that successfully matches the value. The `when()`
function is another utility that creates matches based on its arguments. It
takes a type as its first argument, and a function that is called with the value
of the matched object.

**NOTE:** It is important to keep in mind that the way 'value of' is defined in
Movium is a bit different: if the value passed to the `match()` is an object and
has a `value` property, it is used as a 'value' of that object. Otherwise,
whatever is passed to the `match()` is used as is.

In our case, we only have one message, so we match that, and the callback
updates the model to reassign the new name.

We did not really have to use pattern matching in this example, because it's
such a simple example. It was used simply to show that it's available. The
simplest possible version of the update function would be more along the lines
of:

```javascript
let update = (msg, model) => ({ ...model, name: msg.value })
```

Finally, the view.

```javascript
let view = model => (
  div([],
    p([], 
      input([onInput(SetName)])
    ),
    p([],
      `Hello, ${model.name}`
    ),
  )
)
```

The view is a function that takes a model and returns a render function. It may
no look like it, but `div()` does not return a virtual DOM node. It returns a
function that takes an updater function (not the same as the update function,
though) and returns a virtual DOM node. It's an implementation detail, but may
come in handy when you are doing something a bit more advanced.

Elements, such as `div`, `p`, `ul`, `label`, `input`, and so on, have been
defined as functions and can be imported from the Movium package. Elements take
an array of properties as its first argument, and any number of children as
additional arguments.

Let's take a closer look at the input element:

```javascript
input([onInput(SetName)])
```

The array of properties contains just `onInput(SetName)`. The `onInput()`
function takes a message prototype, `SetName`, and creates an 'input' event
listener that will send a message containing the input's value. Each time we
type into the input, the updater will receive a `SetName` message with
its `value` property set to the input's value.

Lastly, we render the application like this:

```javascript
let root = document.createElement('div')
document.body.appendChild(root)

render(root, init, update, view)
```

We first create a new `<div>`, append it to the body, and call Movium's
`render()` function, passing it the root node, and the init, update, and view
functions.

## Next step

For a slightly more involved example, see 
[Composing modules](./composing-modules.md).
