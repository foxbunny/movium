import { match, when } from './patternMatching'
import { Any, is, Type, ValueObject, Void } from './types'

let id = x => x
let has = (k, x) => Object.prototype.hasOwnProperty.call(x, k)
let valueOf = x => is(ValueObject, x) ? x.value : x
let partial = (f, ...args) => f.bind(undefined, ...args)
let tap = (f, x) => (f(x), x)
let log = partial(tap, x => console.log(x))

let Append = Type.of()
let Call = Type.of()
let Merge = Type.of()

const CopyHandlers = []
let copy = x => match(x,
  ...CopyHandlers,
  when(ValueObject, val => Object.getPrototypeOf(x).val(val)),
  when(Type, () => Object.getPrototypeOf(x).of({ ...x })),
  when(Object, val => ({ ...val })),
  when(Array, val => Array.from(val)),
  when(Set, val => new Set(val)),
  when(Map, val => new Map(val)),
  when(Date, val => new Date(val)),
  when(Any, id),
)
copy.define = (type, handler) => CopyHandlers.unshift(when(type, handler))
copy.remove = type => CopyHandlers.splice(CopyHandlers.indexOf(CopyHandlers.find(x => x.type === type)), 1)

let merge = (x, y) => match(x,
  when(ValueObject, () => Object.getPrototypeOf(x).val(merge(valueOf(x), valueOf(y)))),
  when(Type, () => Object.getPrototypeOf(x).of({ ...x, ...y })),
  when(Object, () => ({ ...x, ...y })),
  when(Array, () => [...x, ...y]),
  when(Set, () => new Set([...x, ...y])),
  when(Map, () => new Map([...x, ...y])),
  when(Number, () => x + y),
  when(String, () => x + y),
  when(Any, () => y),
)

// ([...String, T], U) -> U
let assignPath = (path, x) => {
  path = path.slice()
  x = copy(x)

  let p = valueOf(x)

  while (path.length > 2) {
    let k = path.shift()
    let v = has(k, p) ? copy(p[k]) : {}
    p = valueOf(p[k] = v)
  }

  let [k, v] = path

  p[k] = match(v,
    when(Append, v => match(p[k],
      when(Array, () => [...p[k], v]),
      when(Void, () => v),
      when(Any, () => [p[k], v]),
    )),
    when(Call, f => f(p[k])),
    when(Merge, y => merge(p[k], y)),
    when(Any, () => v),
  )

  return x
}

export {
  Append,
  Call,
  Merge,
  has,
  valueOf,
  id,
  partial,
  log,
  tap,
  copy,
  merge,
  assignPath,
}
