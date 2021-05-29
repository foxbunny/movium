import { a, alt, div, h1, header, href, id, img, input, match, Msg, onInput, p, src, value, when } from 'movium'
import './app.css'
import moviumLogo from './movium.svg'

// MODEL

let init = () => 'Movium'

// UPDATE

let SetName = Msg.of()

let update = (msg, model) => match(msg,
  when(SetName, id),
)

// VIEW

let view = model => (
  div(['app'],
    header(['header'],
      img([src(moviumLogo), alt('Movium')]),
    ),

    p(['input'], input([onInput(SetName), value(model)])),
    p(['greeting'], `Hello, ${model}`),

    div(['tips'],
      h1([], 'What next?'),
      p([],
        'You\'ll find links to the Movium documentation ',
        a([href('https://github.com/foxbunny/movium#documentation')],
          'in the README',
        ),
        '.',
      ),
    ),
  )
)

// EXPORTS

export {
  SetName,
  init,
  update,
  view,
}
