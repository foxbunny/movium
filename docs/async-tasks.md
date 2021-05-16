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
import { button, div, li, match, Msg, onClick, p, render, Task, ul, when } from 'movium'

let init = () => ({
  loading: false,
  error: null,
  data: [],
})

let Load = Msg.of()
let Clear = Msg.of()

let getData = () => fetch('/data.json')
  .then(res => {
    if (!res.ok) throw Error('Could not fetch data')
    return res.json()
  })
  .then(content => ({ data: content.data, error: null }))
  .catch(error => ({ data: [], error }))

let update = (msg, model) => match(msg,
  when(Load, () => Task.from(
    { ...model, loading: true, data: [] },
    getData().then(({ data, error }) => ({ ...model, loading: false, data, error })),
  )),
  when(Clear, () => ({ ...model, loading: false, error: null, data: [] })),
)

let view = model => (
  div([],
    p([],
      button([onClick(Load)], 'Load data'),
      ' ',
      button([onClick(Clear)], 'Clear data'),
    ),
    model.error
      ? p([], 'Error: ', model.error.message)
      : null,
    model.loading
      ? p([], 'Loading...')
      : ul([], model.data.map(d => li([], d.name))),
  )
)

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
```

The model is initialized as usual:

```javascript
let init = () => ({
  loading: false,
  error: null,
  data: [],
})
```

The `error` property will contain any errors encountered while the data is 
being fetched. The `data` property is where the data will be stored once 
fetched. The `loading` property is a flag that is `true` during the fetching 
process.

We have two messages that can be sent to the update function. The `Load` 
message is the interesting one. The other, `Clear` is there to demonstrate 
the difference between async and sync updates.

The update function looks like this:

```javascript
let update = (msg, model) => match(msg,
  when(Load, () => Task.from(
    { ...model, loading: true, data: [] },
    getData().then(({ data, error }) => ({ ...model, loading: false, data, error }),
  )),
  when(Clear, () => ({ ...model, loading: false, error: null, data: [] })
)
```

The `Task.from()` method is the star of the show. It takes a model, and a 
promise that resolves to a model and returns a `Task` object. The model is 
used immediately to update the view, and we usually use this to set the 
state before the task executes (e.g., `loading` flag in this example). The 
promise should resolve to the state of the model after the async task is 
completed. Note that this promise must not reject (if it does, the application 
will crash). In our case, we capture any errors using the `catch()` method, 
and return errors as an `error` property.

We won't go over the view in detail as it does not do anything special.
