let Type = Object.freeze({
  of (x) {
    return Object.create(this, x != null ? Object.getOwnPropertyDescriptors(x) : undefined)
  },
  val (x) {
    return val(this, x)
  },
})

let Any = Type.of()
let Void = Type.of()
let Null = Type.of()
let Undefined = Type.of()
let Iterable = Type.of()
let IterableObject = Type.of()

let TypeInferenceMappings = new Map([
  [Void, x => x == null],
  [Undefined, x => x === void (0)],
  [Null, x => x === null],
  [Iterable, x => x != null && typeof x[Symbol.iterator] === 'function'],
  [IterableObject, x => x != null && typeof x[Symbol.iterator] === 'function' && typeof x === 'object'],
  [Any, () => true],
])

let is = (type, x) => {
  if (type === x) return true
  let test = TypeInferenceMappings.get(type)
  if (test == null) {
    if (x == null) return false
    return type.isPrototypeOf(x) || Object.getPrototypeOf(x) === type || x.constructor === type
  }
  return test(x)
}
is.define = (type, f) => TypeInferenceMappings.set(type, f)
is.remove = type => TypeInferenceMappings.delete(type)

let val = (proto, value) => Object.create(proto, { value: { value, writable: false }})

export {
  Type,
  Any,
  Void,
  Undefined,
  Null,
  Iterable,
  IterableObject,
  is,
  val,
}
