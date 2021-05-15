import { button, className, disabled, div, match, onClick, span, when } from 'movium'

let init = (n = 0) => n

let Inc = {}
let Dec = {}

let update = (msg, model) => match(
  msg,
  when(Inc, () => Math.min(9, model + 1)),
  when(Dec, () => Math.max(0, model - 1)),
)

let view = model => (
  div([className('counter')],
    button([className('counter-inc'), disabled(model === 9), onClick(Inc)], '+'),
    span([className('counter-num')], model),
    button([className('counter-dec'), disabled(model === 0), onClick(Dec)], '-'),
  )
)

export { init, update, view }
