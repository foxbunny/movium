import { match, when } from './patternMatching'
import { Any, is, Type, ValueObject, Void } from './types'

let id = x => x
let has = (k, x) => Object.prototype.hasOwnProperty.call(x, k)
let valueOf = x => is(ValueObject, x) ? x.value : x
let partial = (f, ...args) => f.bind(undefined, ...args)
let tap = (f, x) => (f(x), x)
let log = partial(tap, x => console.log(x))
let using = (expressions, fn) => fn(...expressions)

let Append = Type.of()
let Call = Type.of()
let Merge = Type.of()
let AsyncCall = Type.of()
let Delete = Type.of()

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

// ([...(String|Number), T], U) -> U
let patch = (path, x) => {
  path = path.slice()

  // Object that we will return in the end
  let y = copy(x)

  // Reference to the current part of the object
  let p = valueOf(y)

  // Keep drilling into the object until the past pair
  while (path.length > 2) {
    let k = path.shift()
    let v = has(k, p) ? copy(p[k]) : {}
    p = valueOf(p[k] = v)
  }

  let [k, v] = path

  let w = match(v,
    when(Append, v => match(p[k],
      when(Array, () => [...p[k], v]),
      when(Void, () => v),
      when(Any, () => [p[k], v]),
    )),
    when(Call, f => f(p[k])),
    when(AsyncCall, f => f(p[k])),
    when(Merge, y => merge(p[k], y)),
    when(Any, () => v),
  )

  if (w === p[k]) return x

  if (is(w, Delete)) {
    delete p[k]
    return y
  }

  if (is(AsyncCall, v)) {
    return w.then(w => {
      p[k] = w
      return y
    })
  }

  p[k] = w
  return y
}

let randId = () => Math.random().toString(36).slice(2)

export {
  Append,
  Call,
  AsyncCall,
  Merge,
  Delete,
  has,
  valueOf,
  id,
  partial,
  log,
  using,
  tap,
  copy,
  merge,
  patch,
  randId,
}
