let Type = Object.freeze({})
let subtype = (proto = Type, props) => Object.create(proto, props && Object.getOwnPropertyDescriptors(props))
let valueObj = (proto, value) =>
  Object.create(proto, {
    value: { value, writable: false },
  })
let Any = subtype()
let Void = subtype()
let Null = subtype()
let Undefined = subtype()
let Iterable = subtype()
let IterableObject = subtype()


let TypeInferenceMappings = new Map([
  [Void, x => x == null],
  [Undefined, x => x === void(0)],
  [Null, x => x === null],
  [Iterable, x => x != null && typeof x[Symbol.iterator] === 'function'],
  [IterableObject, x => x != null && typeof x[Symbol.iterator] === 'function' && typeof x === 'object'],
  [Any, () => true],
])

let is = (t, x) => {
  let test = TypeInferenceMappings.get(t)
  if (test == null) {
    if (x == null) return false
    return t.isPrototypeOf(x) || Object.getPrototypeOf(x) === t || x.constructor === t
  }
  return test(x)
}
is.define = (t, f) => TypeInferenceMappings.set(t, f)
is.remove = t => TypeInferenceMappings.delete(t)

export {
  Type,
  Any,
  Void,
  Undefined,
  Null,
  Iterable,
  IterableObject,
  subtype,
  valueObj,
  is,
}
