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

let when = (type, f) => {
  let matcher = x => is(type, x)
    ? Match.val(f(valueOf(x)))
    : Miss.val()
  matcher.type = type
  return matcher
}

export {
  Match,
  Miss,
  match,
  when,
}
