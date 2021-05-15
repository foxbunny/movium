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
