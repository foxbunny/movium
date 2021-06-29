import { valueOf } from './tools'
import { is, Type } from './types'

let Match = Type.of()
let Miss = Type.of()

let match = (x, ...cases) => {
  for (let c of cases) {
    let m = c(x)
    if (is(Match, m)) return valueOf(m)
  }
  throw Error(`No match for ${x}`)
}

let match$ = (...cases) => x => match(x, ...cases)

let whenRaw = (type, f) => x => is(type, x) ? Match.val(f(x)) : Miss.val()
let when = (type, f) => whenRaw(type, x => f(valueOf(x)))
let whenElse = f => x => Match.val(f(x))
let through = x => Match.val(x)

export {
  Match,
  Miss,
  match,
  match$,
  when,
  whenRaw,
  whenElse,
  through,
}
