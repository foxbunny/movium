import { div, input, match, Msg, onInput, p, patch, render, value, when } from 'movium'

// MODEL

let init = () => ({
  name: 'world',
})

// UPDATE

let SetName = Msg.of()

let update = (msg, model) => match(msg,
  when(SetName, name => {
    if (name === 'error') throw Error('omg')
    return patch(['name', name], model)
  }),
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
