import { Msg } from './framework'
import { Any, is, Iterable, IterableObject, Null, Type, Undefined, Void } from './types'

describe('Type', () => {
  test('create a type using of()', () => {
    let x = Type.of()
    expect(Type.isPrototypeOf(x)).toBe(true)
    expect(Object.getPrototypeOf(x)).toBe(Type)
  })

  test('create a type using of() with additional pros', () => {
    let x = Type.of({ foo: 'bar' })
    expect(x.foo).toBe('bar')
    expect(Object.prototype.hasOwnProperty.call(x, 'foo')).toBe(true)
    expect(Type.isPrototypeOf(x)).toBe(true)
    expect(Object.getPrototypeOf(x)).toBe(Type)
  })

  test('create a value object using val()', () => {
    let x = Type.val(1)
    expect(x.value).toBe(1)
    expect(Type.isPrototypeOf(x)).toBe(true)
    expect(Object.getPrototypeOf(x)).toBe(Type)
  })
})

describe('is', () => {
  test('equality to self', () => {
    expect(is(Type, Type)).toBe(true)
    expect(is(Any, Any)).toBe(true)
    expect(is(1, 1)).toBe(true)
  })

  test.each([
    ['str', String],
    [[1, 2, 3], Array],
    [3, Number],
    [{}, Object],
    [new Date(), Date],
    [Msg.val('test'), Msg],
    [[1, 2, 3], Iterable],
    ['string', Iterable],
    [new Set(), Iterable],
    [new Map(), Iterable],
    [[1, 2, 3], IterableObject],
    [new Set(), IterableObject],
    [new Map(), IterableObject],
    [null, Null],
    [null, Void],
    [undefined, Undefined],
    [undefined, Void],
    ['str', Any],
    [[1, 2, 3], Any],
    [3, Any],
    [{}, Any],
    [new Date(), Any],
    [Msg.val('test'), Any],
    [new Set(), Any],
    [null, Any],
    [undefined, Any],
    [new Date(), Any],
  ])(
    '%s is of type %s',
    (x, type) => {
      expect(is(type, x)).toBe(true)
    }
  )

  let Fooable = Type.of()

  test('define custom types', () => {
    is.define(Fooable, x => x != null && typeof x.foo === 'function')
    expect(is(Fooable, { foo() {} })).toBe(true)
    expect(is(Fooable, { foo: true })).toBe(false)
    is.remove(Fooable)
  })

  test('remove a defined type', () => {
    is.define(Fooable, x => x != null && typeof x.foo === 'function')
    is.remove(Fooable)
    expect(is(Fooable, { foo() {} })).toBe(false)
  })

  test('redefine existing definitions', () => {
    is.define(Fooable, x => x != null && typeof x.foo === 'function')
    is.define(Fooable, x => x != null && x.foo != null)
    expect(is(Fooable, { foo() {} })).toBe(true)
    expect(is(Fooable, { foo: true })).toBe(true)
    is.remove(Fooable)
  })

  test('test against any member of the inheritance chain', () => {
    let Foo = Type.of()
    let Bar = Foo.of()
    let baz = Bar.of({ test: 'me' })

    expect(is(Bar, baz)).toBe(true)
    expect(is(Foo, baz)).toBe(true)
  })
})


