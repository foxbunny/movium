import { button, className, div, li, match, onClick, p, scope, ul, valueObj, when } from 'movium'
import './app.css'
import * as counter from './counter'

let init = (n = 0) => ({
  n100: counter.init(Math.floor(n / 100)),
  n10: counter.init(Math.floor(n % 100 / 10)),
  n1: counter.init(n % 100 % 10),
  initialValue: n,
})

let InCounter = {}
let Reset = {}

let update = (msg, model) => match(msg,
  when(Reset, () => init(model.initialValue)),
  when(InCounter, ({ key, msg }) => ({
      ...model,
      [key]: counter.update(msg, model[key]),
    }),
  ),
)

let num = model =>
  model.n100 * 100 +
  model.n10 * 10 +
  model.n1

let scopedCounter = (model, key) => (
  li([className('counter-digit')],
    scope(
      msg => valueObj(InCounter, { key, msg }),
      counter.view(model),
    ),
  )
)

let view = model => (
  div([className('app')],
    p([className('display')], 'your number is: ', num(model)),
    ul([className('counter-list')],
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
