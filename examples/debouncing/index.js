import { debounced, div, id, input, match, Msg, onInput, p, render, value, when } from 'movium'

// MODEL

let init = () => ''

// UPDATE

let SetText = Msg.of()

let update = msg => match(msg,
  when(SetText, id)
)

// VIEW

let view = model => (
  div([],
    p([], 'You typed: ', model),
    p([],
      input([value(model), onInput(debounced(300, SetText))])
    ),
  )
)

// EXPORTS

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
