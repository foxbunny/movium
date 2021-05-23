import { button, className, disabled, div, match, Msg, onClick, span, when } from 'movium'

// MODEL

let init = (n = 0) => n

// UPDATE

let Inc = Msg.of()
let Dec = Msg.of()

let update = (msg, model) => match(msg,
  when(Inc, () => Math.min(9, model + 1)),
  when(Dec, () => Math.max(0, model - 1)),
)

// VIEW

let view = model => (
  div(['counter'],
    button(['counter-inc', disabled(model === 9), onClick(Inc)], '+'),
    span(['counter-num'], model),
    button(['counter-dec', disabled(model === 0), onClick(Dec)], '-'),
  )
)

export { init, update, view }
