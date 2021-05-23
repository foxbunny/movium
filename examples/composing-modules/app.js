import { button, div, li, match, Msg, onClick, p, scope, ul, when } from 'movium'
import './app.css'
import * as counter from './counter'

// MODEL

let init = (n = 0) => ({
  n100: counter.init(Math.floor(n / 100)),
  n10: counter.init(Math.floor(n % 100 / 10)),
  n1: counter.init(n % 100 % 10),
  initialValue: n,
})

// UPDATE

let InCounter = Msg.of()
let Reset = Msg.of()

let update = (msg, model) => match(msg,
  when(Reset, () => init(model.initialValue)),
  when(InCounter, ({ key, msg }) => ({
      ...model,
      [key]: counter.update(msg, model[key]),
    }),
  ),
)

// VIEW

let num = model =>
  model.n100 * 100 +
  model.n10 * 10 +
  model.n1

let scopedCounter = (model, key) => (
  li(['counter-digit'],
    scope(
      msg => InCounter.val({ key, msg }),
      counter.view(model),
    ),
  )
)

let view = model => (
  div(['app'],
    p(['display'], 'your number is: ', num(model)),
    ul(['counter-list'],
      scopedCounter(model.n100, 'n100'),
      scopedCounter(model.n10, 'n10'),
      scopedCounter(model.n1, 'n1'),
    ),
    p([],
      button([onClick(Reset)], 'Reset')
    )
  )
)

export { init, update, view }
