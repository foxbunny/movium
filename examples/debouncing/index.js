import { div, id, input, match, Msg, onInput, p, render, value, when } from 'movium'

// MODEL

let init = () => ''

// UPDATE

let SetText = Msg.of()

let update = msg => match(msg,
  when(SetText, id)
)

// VIEW

let debounced = msg => (ev, vnode, updater) => {
  clearTimeout(vnode.elm.lastCall)
  vnode.elm.lastCall = setTimeout(() => updater(msg.val(ev.target.value)), 300)
}

let view = model => (
  div([],
    p([], 'You typed: ', model),
    p([],
      input([value(model), onInput(debounced(SetText))])
    ),
  )
)

// EXPORTS

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
