import {
  div,
  id,
  input,
  match,
  Msg,
  onBlur,
  onClick,
  onInput,
  onKey,
  render,
  span,
  tabIndex,
  value,
  when,
} from 'movium'
import './index.css'

// MODEL

let init = () => 'Hello, world'

// UPDATE

let SetText = Msg.of()

let update = msg => match(msg,
  when(SetText, id),
)

// VIEW

let activateEditableText = (_1, _2, vnode) => {
  let self = vnode.elm
  self.classList.remove('editable-text-active')
  self.previousSibling.classList.add('editable-text-active')
  self.previousSibling.focus()
}
let deactivateEditableText = (_1, _2, vnode) => {
  let self = vnode.elm
  self.classList.remove('editable-text-active')
  self.nextSibling.classList.add('editable-text-active')
  self.nextSibling.focus()
}

let editableText = options => (
  span(['editable-text'],
    input([
      'editable-text-input',
      value(options.value),
      onInput(options.onInput),
      onBlur(deactivateEditableText),
      onKey('Escape', deactivateEditableText),
      onKey('Enter', deactivateEditableText),
    ]),
    span([
        'editable-text-display editable-text-active',
        tabIndex(0),
        onClick(activateEditableText),
        onKey('Enter', activateEditableText),
      ],
      options.value,
    ),
  )
)

let view = model => (
  div([],
    editableText({ value: model, onInput: SetText }),
  )
)

// RENDER

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
