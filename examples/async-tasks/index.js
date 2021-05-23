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
  Task,
  Type,
  when,
} from 'movium'

// MODEL

let Loading = Type.of()
let Failed = Type.of()
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
    when(HttpError, error => Failed.val(error)),
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
      when(Failed, () => 'Error while loading data'),
    ),
  )
)

// RENDER

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
