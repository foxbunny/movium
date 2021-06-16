let val = (proto, value) => Object.create(proto, { value: { value, writable: false, enumerable: true }})

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
let NonVoid = Type.of()
let Null = Type.of()
let Undefined = Type.of()
let Iterable = Type.of()
let IterableObject = Type.of()
let ValueObject = Type.of()
let Primitive = Type.of()
let Complex = Type.of()
let EmptyObject = Type.of()
let Empty = Type.of()

const PRIMITIVE_TYPES = [String, Number, Boolean, RegExp, Symbol]

let hasOnlyValueProperty = x => {
  for (let k in x) if (Object.prototype.hasOwnProperty.call(x, k) && k !== 'value') return false
  return true
}

let TypeInferenceMappings = new Map([
  [Void, x => x == null],
  [NonVoid, x => x != null],
  [Undefined, x => x === void (0)],
  [undefined, x => x === void (0)],
  [Null, x => x === null],
  [null, x => x === null],
  [Iterable, x => is(NonVoid, x) && typeof x[Symbol.iterator] === 'function'],
  [IterableObject, x => is(NonVoid, x) && typeof x[Symbol.iterator] === 'function' && typeof x === 'object'],
  [ValueObject, x => is(NonVoid, x) && is(Type, x) && hasOnlyValueProperty(x)],
  [Primitive, x => is(Void, x) || PRIMITIVE_TYPES.includes(x.constructor)],
  [Complex, x => is(NonVoid, x) && typeof x === 'object'],
  [EmptyObject, x => {
    if (!is(Object, x)) return false
    for (let k in x) if (Object.prototype.hasOwnProperty.call(x, k)) return false
    return true
  }],
  [Empty, x => is(Void, x) || is(EmptyObject, x) || x.length === 0 || x.size === 0],
  [Any, () => true],
])

let is = (type, x) => {
  if (type === x) return true
  let test = TypeInferenceMappings.get(type)
  if (test) {
    return test(x)
  }
  if (x == null) return false
  return (
    type.isPrototypeOf(x) ||
    Object.getPrototypeOf(x) === type ||
    Object.getPrototypeOf(x) === type.prototype ||
    x.constructor === type
  )
}
is.define = (type, f) => TypeInferenceMappings.set(type, f)
is.remove = type => TypeInferenceMappings.delete(type)

export {
  Type,
  Any,
  Void,
  NonVoid,
  Undefined,
  Null,
  Iterable,
  IterableObject,
  ValueObject,
  Primitive,
  Complex,
  EmptyObject,
  Empty,
  is,
  val,
}
