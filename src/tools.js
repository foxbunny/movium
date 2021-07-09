import { match, through, when, whenElse } from './patternMatching'
import { Any, is, Type, ValueObject, Void } from './types'

let id = x => x
let has = (k, x) => Object.prototype.hasOwnProperty.call(x, k)
let has$ = k => x => has(k, x)
let valueOf = x => is(ValueObject, x) ? x.value : x
let partial = (f, ...args) => f.bind(undefined, ...args)
let tap = (f, x) => (f(x), x)
let tap$ = f => x => tap(f, x)
let log = partial(tap, x => console.log(x))

let Assign = Type.of()
let Append = Type.of()
let Call = Type.of()
let Merge = Type.of()
let Delete = Type.of()
let Pluck = Type.of()
let KeyOf = Type.of()
let IndexOf = KeyOf

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

let keyOf = (v, x) => match(x,
  when(Array, () => {
    let idx = x.indexOf(v)
    if (idx < 0) throw Error(`${v} not found in ${x}`)
    return idx
  }),
  when(Map, () => {
    for (let [k, v1] of x) if (v === v1) return k
    throw Error(`${v} not found in ${x}`)
  }),
  whenElse(() => {
    for (let k in x) if (has(k, x) && x[k] === v) return k
    throw Error(`${v} not found in ${x}`)
  }),
)

// (String[], T) -> U
let get = (path, x) => {
  for (let k of path) {
    if (x == null || !has(k, x)) return
    x = x[k]
  }
  return x
}
let get$ = path => x => get(path, x)

let getKey = (k, x) => match(k,
  when(KeyOf, v => keyOf(v, x)),
  through,
)

let setVal = (k, v, x) => match(x,
  when(Map, () => (x.set(k, v), v)),
  whenElse(() => x[k] = v)
)

let deleteKey = (k, x) => match(x,
  when(Array, () => x.splice(k, 1)),
  when(Map, () => x.delete(k)),
  whenElse(() => delete x[k]),
)

// ([...(String|Number), T], U) -> U
let patch = (path, x) => {
  path = path.slice()

  // Reference to the copy of the entire input object
  let y = copy(x)

  // Reference to the current part of the object,
  // which starts as the whole object
  let p = valueOf(y)

  // Keep drilling into the object until the last pair
  while (path.length > 2) {
    let k = getKey(path.shift(), p)
    let v = has(k, p)
      ? copy(p[k])
      : typeof path[0] === 'number' ? [] : {} // Create an array if the next key is numeric
    // Update the reference and set the copy to the current key
    p = valueOf(setVal(k, v, p))
  }

  let [k, v] = path
  k = getKey(k, p)

  // Some of the wrappers are handled here because
  // they only affect the value that is going to be
  // assigned.
  let w = match(v,
    when(Append, v => match(p[k],
      when(Array, () => [...p[k], v]),
      when(Void, () => v),
      when(Any, () => [p[k], v]),
    )),
    when(Call, f => f(p[k])),
    when(Merge, y => merge(p[k], y)),
    whenElse(() => v),
  )

  // Other wrappers are handled here because they
  // affect how the value will be assigned (if at
  // all).
  return match(w,
    when(p[k], () => x),
    when(Assign, w => {
      p[k] = w
      return y
    }),
    when(Delete, k1 => match(k1,
      when(Delete, () => {
        deleteKey(k, p)
        return y
      }),
      when(Void, () => {
        deleteKey(k, p)
        return y
      }),
      whenElse(() => {
        deleteKey(k1, p[k])
        return y
      }),
    )),
    when(Pluck, w => match(p[k],
      when(Array, () => {
        p[k].splice(keyOf(w, p[k]), 1)
        return y
      }),
      when(Set, () => {
        p[k].delete(w)
        return y
      }),
      whenElse(() => y),
    )),
    when(Promise, () => w.then(w => {
      setVal(k, w, p)
      return y
    })),
    whenElse(() => {
      setVal(k, w, p)
      return y
    })
  )
}

let patch$ = path => x => patch(path, x)

let randId = () => Math.random().toString(36).slice(2)

let pipe = (x, ...fns) => fns.reduce((x, f) => f(x), x)
let pipe$ = (...fns) => x => pipe(x, ...fns)
let apply = (args, f) => f(...args)
let apply$ = f => args => apply(args, f)

export {
  Assign,
  Append,
  Call,
  Merge,
  Delete,
  Pluck,
  KeyOf,
  IndexOf,
  has,
  has$,
  valueOf,
  id,
  partial,
  log,
  tap,
  tap$,
  copy,
  merge,
  keyOf,
  get,
  get$,
  patch,
  patch$,
  randId,
  pipe,
  pipe$,
  apply,
  apply$,
}
