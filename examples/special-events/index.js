import {
  assignPath, button,
  Call,
  className,
  div,
  match,
  Msg, onClick,
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
  borderColor: 'blue',
  messageShown: true,
})

let ChangeBorderColor = Msg.of()
let HideMessage = Msg.of()

let update = (msg, model) => match(msg,
  when(ChangeBorderColor, () => assignPath(['borderColor', Call.val(c => NEXT_COLOR[c])], model)),
  when(HideMessage, () => assignPath(['messageShown', false], model)),
)

let view = model => (
  div([className('border'), style({ backgroundColor: model.borderColor })],
    model.messageShown
      ? div([
        className('inner'),
        onMouseDownOutside(ChangeBorderColor, prevent),
        onKeyDocument('Space', ChangeBorderColor),
      ],
      p([className('message')],
        'Click on the colored border to toggle its color. You can also press ' +
        'space to achieve the same. If you click on this box, the color will ' +
        'not toggle. You can use the button below to remove the element that ' +
        'has the special event attached to it. Once the box is removed, you ' +
        'should not be able to toggle the colors anymore.',
      ),
      p([],
        button([onClick(HideMessage)], 'Hide this box'),
      ),
      )
      : null,
  )
)

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
