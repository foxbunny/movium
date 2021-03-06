import { div, GET, HttpError, HttpResult, jsonResponse, li, match, Msg, render, Task, Type, ul, when } from 'movium'

// MODEL

let Loading = Type.of()
let Loaded = Type.of()
let Failed = Type.of()

let init = () => Task.from(Loading.of(), GET('/data.json').expect(jsonResponse), Ready)

// UPDATE

let Ready = Msg.of()

let update = msg => match(msg,
  when(Ready, result => match(result,
    when(HttpResult, data => Loaded.val(data.data)),
    when(HttpError, () => Failed.val('Oh, noes!'))
  )),
)

// VIEW

let view = model => (
  div([],
    match(model,
      when(Loading, () => 'Loading...'),
      when(Loaded, data => ul([], data.map(d => li([], d.name)))),
      when(Failed, () => 'Error while loading data'),
    ),
  )
)

// RENDER

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
