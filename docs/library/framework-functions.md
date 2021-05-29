# Framework functions

## Contents

<!-- vim-markdown-toc GFM -->

* [render(root, init, update, view, [modules])](#renderroot-init-update-view-modules)
* [scope(proto, view)](#scopeproto-view)
* [Msg](#msg)
* [Task](#task)
* [DoNothing](#donothing)
* [isMsg(proto, x)](#ismsgproto-x)
* [inMsgs(protos, x)](#inmsgsprotos-x)
* [See also](#see-also)

<!-- vim-markdown-toc -->

## render(root, init, update, view, [modules])

To render the application we use the `render()` function.

This function takes the following arguments:

- `root` - DOM node at which the application is mounted (the root node of the
  application patches and replaces the specified node, so it must not be
  `document.body`)
- `init` - a function that returns the intiial model object (usually, but not
  necessaryly the application main module's `init()`)
- `update` - the update function that will handle messages and update the
  model (usually, but not necessarily the application module's `update()`)
- `view` - a function that takes a model and returns a renderer function that
  takes an updater functon and returns virtual nodes (usually, but not
  necessarily, the application module's `view()`)
- `modules` - an optional array of additional snabbdom modules that
  should be added to the patch function

The render function starts by creating the initial model using the `init`
function. This can be either a model object or a `Task` (see Task in this 
document). It then creates the updater function and renders the initial view.

Whenever the view emits a message, a new version of the model is calculated
using the supplied `update()` function, and the view is re-rendered. Rendering
is always scheduled using `requestAnimationFrame()` so that the render function
does not enter a recursion and cause the stack overflow error.

Errors that happen within views, tasks, or updates are captured and logged to
the console. This prevents the application from crashing due to uncaught
exceptions. Although the captured exceptions are inaccessible to the
application, the application code will continue to work based on the previous
state.

## scope(proto, view)

When we are dealing with the models from a different model, we usually want 
to relay all messages emitted by that module to its update handler. We don't 
want to pattern-match on individual message types from the other module so 
that we can keep the two modules decoupled. In order to achieve this, we 
want to wrap all messages coming from the other module in a single message 
prototype and then unpack the original message before calling the other 
module's update function.

To make this easier, Movium provides a `scope()` function. It takes two 
arguments:

- `proto` - message prototype, or a function
- `view` - a view function (result of calling one of the element functions, for
  example; a function that takes an updater and returns a virtual node)

The first argument is usually a message prototype, but can also be a function
that takes the message emitted from the view (which is the second argument) 
and returns a wrapped message object.

Here's an example of a simple scoped view with matching update function:

```javascript
import { Msg, scope, div, match, when, assignPath } from 'movium'
import * as submodule from './submodule'

let init = () => ({
  sub: submodule.init(),
})

let InSubmodule = Msg.of()

let update = (msg, model) => match(msg, 
  when(InSubmodule, msg => 
    assignPath(['sub', submodule.update(msg, model.submodule)], model)
  ),
)

let view = model => (
  div([],
    scope(InSubmodule, submodule.view(model.sub))
  )
)
```

Any message emitted by the submodule's view is wrapped in `InSubmodule` so 
they can be funneled into a single branch in our pattern matching. Then the 
message stored in the `InSubmodule` message is unwrapped and relayed to the 
submodule's update function.

Here's another example when we want to render multiple instances of another
module's view:

```javascript
import { Msg, scope, div, match, when, assignPath, Call } from 'movium'
import * as submodule from './submodule'

let init = () => ({
  subs: [
    submodule.init(),
    submodule.init(),
  ],
})

let InSubmodule = Msg.of()

let update = (msg, model) => match(msg, 
  when(InSubmodule, ({ msg, item }) => 
    assignPath([
      'sub', 
      Call.val(x => x === item ? submodule.update(msg, x) : x),
    ], model)
  ),
)

let view = model => (
  div([],
    model.subs.map(item => scope(
      msg => InSubmodule.val({ msg, item }),
      submodule.view(item)
    ))
  )
)
```

This time, each item in the `model.subs` array is rendered as a separate 
view. Each view is then scoped so that messages coming from them will be 
wrapped in a `InSubmodule` prototype. However, we also need to identify 
which item sent the message, so we use a function to wrap both the message 
and the item. The `InSubmodule` is given an object that has `item` and `msg` 
properties. You can name the properties anything you want, but there are 
functions that rely on the wrapped message being called `msg` (e.g., `isMsg()` 
and `inMsgs()`).

## Msg

Prototype used for message objects. Messages do not *have* to use the `Msg`
prototype, but doing so will give us an opportunity to add various properties
common to all messages. This is how we would share some information across 
the application if needed.

Here's an example of dependency injection using a Msg object:

```javascript
// Module A

import { Msg, inMsgs } from 'movium'
import { Set, Update } from './submodule'

Msg.skipUndo = []
Msg.shouldSkipUndo = msg => inMsgs(Msg.skipUndo, msg)

let updateWithUndo = (msg, model) => { /* ... */ }
let updateWithoutUndo = (msg, model) => { /* ... */ }

let update = (msg, model) => Msg.shouldSkipUndo(msg) 
  ? updateWithoutUndo(msg, model)
  : updateWithUndo(msg, model)

// Module B

import { Msg, assignPath, Append } from 'movium'

let Start = Msg.of()
let Update = Msg.of()
let Finish = Msg.of()

assignPath(['skipUndo', [...Msg.skipUndo, Start, Update]], Msg)
```

## Task

Tasks are objects that represent a two-stage update. They are comprised of three
elements:

- model - state to be applied immediately
- work - a `Promise` object that resolves to some value
- message - a message prototype that is emitted with the value or an error 
  object once the work is done

Tasks are constructed either in the `init()` or the `update()` function, and
are return instead of the model in both cases.

The `Task` prototype has a `from()` function that is used to construct objects.
This function takes three arguments: the model, work, and message.

Here's an example:

```javascript
import { 
  Type, 
  Task, 
  Msg, 
  match, 
  when, 
  GET, 
  jsonResponse, 
  HttpResult, 
  HttpError,
} from 'movium'

let Blank = Type.of()
let Loading = Type.of()
let Loaded = Type.of()
let Error = Type.of()

let init = Blank.of()

let StartLoading = Msg.of()
let ReceiveResult = Msg.of()

let update = (msg, model) => match(msg,
  when(StartLoading, () => Task.from(
    Loading.of(),
    GET('/some-data').expect(jsonResponse),
    ReceiveResponse,
  )),
  when(ReceiveResult, result => match(result,
    when(HttpResult, data => Loaded.of(data)),
    when(HttpError, error => Error.val(error))
  )),
)
```

It's important to keep in mind that the promise in the task does not return a
model, but a value that should be handled in the update function using the
message in the task.

## DoNothing

This is a prototype that can be used in update functions to signal that we want
to abort the update.

To abort the update, we simply return `DoNothing` instead of the model.

## isMsg(proto, x)

Returns `true` if `x` is or contains a message that matches the `proto`
prototype. By 'is or contains' we mean that `x` is a non-void value which
satisfies at least one of the following:

- `x` is `proto`
- `x` is a descendant of `proto` 
- `x.value` is `proto` or is a descendant of `proto`
- `x.msg` is `proto` or is a descendant of `proto`
- `x.value.msg` is `proto` or is a descendant of `proto`

The last point in particular is of importance when dealing with scoped views as
discussed in the [scoped() section](#scopeproto-view).

## inMsgs(protos, x)

Does the same as `isMsg()`, but tests multiple prototypes in the `protos`
array and returns `true` if at least one of the prototypes is a match according
to the rules we discussed under `isMsg()`.

## See also

- [HTML](./html.md)
- [HTTP](./http.md)
- [Snabbdom modules](./snabbdom-modules.md)
- [Types](./types.md)
- [Pattern Matching](./pattern-matching.md)
- [Tools](./tools.md)
