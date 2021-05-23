import { has } from './tools'

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
let ValueObject = Type.of()
let Primitive = Type.of()
let Complex = Type.of()

const PRIMITIVE_TYPES = [String, Number, Boolean, RegExp, Symbol]

let TypeInferenceMappings = new Map([
  [Void, x => x == null],
  [Undefined, x => x === void (0)],
  [Null, x => x === null],
  [Iterable, x => x != null && typeof x[Symbol.iterator] === 'function'],
  [IterableObject, x => x != null && typeof x[Symbol.iterator] === 'function' && typeof x === 'object'],
  [ValueObject, x => x != null && has('value', x) && is(Type, x)],
  [Primitive, x => x == null || PRIMITIVE_TYPES.includes(x.constructor)],
  [Complex, x => x != null && typeof x === 'object'],
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

let val = (proto, value) => Object.create(proto, { value: { value, writable: false }})

export {
  Type,
  Any,
  Void,
  Undefined,
  Null,
  Iterable,
  IterableObject,
  ValueObject,
  Primitive,
  Complex,
  is,
  val,
}
