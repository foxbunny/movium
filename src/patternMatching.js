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

let whenRaw = (type, f) => x => is(type, x) ? Match.val(f(x)) : Miss.val()
let when = (type, f) => whenRaw(type, x => f(valueOf(x)))

export {
  Match,
  Miss,
  match,
  when,
  whenRaw,
}
