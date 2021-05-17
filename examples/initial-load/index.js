import { div, GET, HttpError, HttpResult, jsonResponse, li, match, Msg, render, Task, Type, ul, when } from 'movium'

// MODEL

let getData = () => fetch('/data.json')
  .then(res => {
    if (!res.ok) throw Error('Could not fetch data')
    return res.json()
  })
  .then(content => ({ data: content.data, error: null }))
  .catch(error => ({ data: [], error }))

let Loading = Type.of()
let Loaded = Type.of()
let Error = Type.of()

let init = () => Task.from(Loading.of(), GET('/data.json').expect(jsonResponse), Ready)

// UPDATE

let Ready = Msg.of()

let update = (msg, model) => match(msg,
  when(Ready, result => match(result,
    when(HttpResult, data => Loaded.val(data.data)),
    when(HttpError, () => Error.val('Oh, noes!'))
  )),
)

// VIEW

let view = model => (
  div([],
    match(model,
      when(Loading, () => 'Loading...'),
      when(Loaded, data => ul([], data.map(d => li([], d.name)))),
      when(Error, () => 'Error while loading data'),
    ),
  )
)

// RENDER

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
