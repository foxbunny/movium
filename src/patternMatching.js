import { valueOf } from './tools'
import { valueObj, is, subtype } from './types'

let MatchResult = subtype()
let Match = subtype(MatchResult)
let Miss = subtype(MatchResult)

let match = (x, ...cases) => {
  for (let c of cases) {
    let m = c(x)
    if (is(Match, m)) return valueOf(m)
  }
  throw Error(`No match for ${x}`)
}

let when = (type, f) => x => is(type, x)
  ? valueObj(Match, f(valueOf(x)))
  : valueObj(Miss)

export {
  match,
  when,
}
