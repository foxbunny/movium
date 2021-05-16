import {
  assignPath,
  Call,
  className,
  div,
  match,
  Msg,
  onKeyDocument,
  onMouseDownOutside,
  p,
  prevent,
  render,
  style,
  when,
} from 'movium'
import './index.css'

let NEXT_COLOR = {
  blue: 'green',
  green: 'red',
  red: 'yellow',
  yellow: 'blue',
}

let init = () => ({
  borderColor: 'blue'
})

let ChangeBorderColor = Msg.of()

let update = (msg, model) => match(msg,
  when(ChangeBorderColor, () => assignPath(['borderColor', Call.val(c => NEXT_COLOR[c])], model)),
)

let view = model => (
  div([className('border'), style({ backgroundColor: model.borderColor }), onKeyDocument('Space', ChangeBorderColor)],
    div([className('inner'), onMouseDownOutside(ChangeBorderColor, prevent)],
      p([className('message')],
        'Click on the colored border to toggle its color. You can also press ' +
        'space to achieve the same. If you click on this box, the color will ' +
        'not toggle.',
      )
    ),
  )
)

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
