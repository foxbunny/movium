import { match, when } from './patternMatching'
import { Any, Type, Void } from './types'

let id = x => x
let has = (k, o) => Object.prototype.hasOwnProperty.call(o, k)
let isVoid = x => x == null
let isValueObject = x => has('value', x)
let valueOf = x => isVoid(x) ? x : isValueObject(x) ? x.value : x
let tap = (f, x) => {
  f(x)
  return x
}

let Append = Type.of()
let Call = Type.of()

// ([...String, T], Object) -> Object
let assignPath = (path, o) => {
  let p = o
  while (path.length > 2) {
    let k = path.shift()
    if (!has(k, p)) p[k] = {}
    p = p[k]
  }
  let [k, v] = path
  p[k] = match(v,
    when(Append, v => match(
      p[k],
      when(Array, () => [...p[k], v]),
      when(Void, () => v),
      when(Any, () => [p[k], v]),
    )),
    when(Call, f => f(p[k])),
    when(Any, () => v),
  )
  return o
}

// (((...T, U) -> V), ...T) -> U -> V
let partial = (f, ...args) => f.bind(undefined, ...args)

// T -> T
let log = x => console.log(x) ||  x

export {
  Append,
  Call,
  has,
  valueOf,
  id,
  assignPath,
  partial,
  log,
  tap,
}
