import { div, input, match, Msg, onInput, p, patch, render, value, when, whenElse } from 'movium'

// MODEL

let init = () => ({
  name: 'world',
})

// UPDATE

let SetName = Msg.of()

let update = (msg, model) => match(msg,
  when(SetName, name => ({ ...model, name })),
)

// VIEW

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

// RENDER

let root = document.createElement('div')
document.body.appendChild(root)

render(root, init, update, view)
