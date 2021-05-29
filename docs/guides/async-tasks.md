# Async tasks

This chapter will discuss handling async operations in the update function. 
The fully functional version of the code found in this chapter can be found 
in the `examples` folder.

## Updates and async operations

Update functions are synchronous. When they are called with a message, and a 
model, they are expected to return a model.

Sometimes, though, we want to perform an asynchronous task such as fetch data
from or send data to the server. Once we are done with the task, we want to
update the model. The catch is, the update function expects the new model
immediately, and we don't have one. Async tasks are meant to address this issue.

Async tasks (or just tasks) are returned from the update function, and they 
contain a new version of the model right before the task is executed, and a 
promise that resolves to the version of the model after the task is finished.

## Data loader example

Let's take a look at a very simple example of an application that fetches 
some data.

```javascript
import {
  button,
  div,
  GET,
  HttpError,
  HttpResult,
  jsonResponse,
  li,
  match,
  Msg,
  onClick,
  p,
  render,
  Task, Type,
  ul,
  when,
} from 'movium'

// MODEL

let Loading = Type.of()
let Error = Type.of()
let Loaded = Type.of()

let init = () => Loaded.val([])

// UPDATE

let Load = Msg.of()
let ReceiveData = Msg.of()
let Clear = Msg.of()

let update = (msg, model) => match(msg,
  when(Load, () => Task.from(Loading.of(), GET('/data.json').expect(jsonResponse), ReceiveData)),
  when(ReceiveData, result => match(result,
    when(HttpResult, data => Loaded.val(data.data)),
    when(HttpError, error => Error.val(error)),
  )),
  when(Clear, () => init()),
)

// VIEW

let view = model => console.log(model) || (
  div([],
    p([],
      button([onClick(Load)], 'Load data'),
      ' ',
      button([onClick(Clear)], 'Clear data'),
    ),
    match(model,
      when(Loading, () => 'Loading...'),
      when(Loaded, data => data.map(d => li([], d.name))),
      when(Error, () => 'Error while loading data'),
    ),
  )
)

// RENDER

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
```

We use three types to differentiate between three states in which the 
application can be in:

```javascript
let Loading = Type.of()
let Error = Type.of()
let Loaded = Type.of()
```

The initial state is `Loaded`:

```javascript
let init = () => Loaded.val([])
```

We use the `Loaded` type to create a value object containing an empty array, 
which represents our initial data.

We also have three messages. The `Load` message is used instruct the 
application to initiate a HTTP request to fetch the data. The `ReceiveData` 
message will be used once the HTTP request is finished. The `Clear` message 
is used to clear the data.

The update function looks like this:

```javascript
let update = (msg, model) => match(msg,
  when(Load, () => Task.from(Loading.of(), GET('/data.json').expect(jsonResponse), ReceiveData)),
  when(ReceiveData, result => match(result,
    when(HttpResult, data => Loaded.val(data.data)),
    when(HttpError, error => Error.val(error)),
  )),
  when(Clear, () => init()),
)
```

The first thing to discuss is the `Task` type. This type has a factory 
function `from()` which is used to create new tasks. Tasks have three parts 
which correspond to the arguments passed to `from()`:

- the state of the model before the task is carried out
- a `Promise` that resolves to the result of the task
- a message that will be sent once the task is finished

In this example, the state of the model before the task is a `Loading` 
object with no value. The task is created using Movium's HTTP functions 
(although you can use `fetch()` or `axios` or anything that returns a Promise).
The `GET` function returns a `HttpRequest` object, which has an `expect()` 
method. We call the `expect()` with the Movium-provided `jsonResponse` 
expecter, which starts the request and attempts to parse the response data 
as JSON. Lastly, we specify that we want to have `ReceiveData` sent to the 
update function once the task is completed.

The update function receives the `ReceiveData` message which has the result 
of the HTTP request in it. Results can be of either the `HttpResult` or 
the `HttpError` type. We pattern-match on the result to return an 
appropriate type of the model.

The view simply pattern-matches on the type of the model to determine the 
interface elements for various stats of the request.

## See also

- [Extending Movium](./extending-movium.md)
