import { Msg } from './framework'
import { is, Iterable, valueObj, Null, Undefined, Void, Any, IterableObject, subtype } from './types'

describe('is', () => {
  test.each([
    ['str', String],
    [[1, 2, 3], Array],
    [3, Number],
    [{}, Object],
    [new Date(), Date],
    [valueObj(Msg, 'test'), Msg],
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
    [valueObj(Msg, 'test'), Any],
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

  let Fooable = subtype()

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
    let Foo = subtype()
    let Bar = subtype(Foo)
    let baz = subtype(Bar, { test: 'me' })

    expect(is(Bar, baz)).toBe(true)
    expect(is(Foo, baz)).toBe(true)
  })
})


