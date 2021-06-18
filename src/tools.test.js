import { Msg } from './framework'
import {
  Append,
  AsyncCall,
  Call,
  copy,
  Delete,
  get,
  has,
  id,
  log,
  merge,
  Merge,
  partial,
  patch,
  tap,
  using,
  valueOf,
} from './tools'
import { Type } from './types'

describe('has', () => {
  test('test for own property', () => {
    let x = { foo: 'bar', bar: 'baz' }
    let y = Object.create(x)
    y.foo = 'override'
    expect(has('foo', y)).toBe(true)
    expect(has('bar', y)).toBe(false)
  })

  test('test for array indices', () => {
    let a = [1, 2, 3]
    expect(has(0, a)).toBe(true)
    expect(has('length', a)).toBe(true)
    expect(has('map', a)).toBe(false)
  })
})

describe('valueOf', () => {
  test('get value of a value object', () => {
    let v = Msg.val('test')
    expect(valueOf(v)).toBe('test')
  })

  test('get value of void', () => {
    expect(valueOf()).toBe(undefined)
    expect(valueOf(null)).toBe(null)
  })

  test('get value of primitive values', () => {
    for (let x of [1, true, false, ''])
      expect(valueOf(x)).toBe(x)
  })

  test.each([
    [[1, 2, 3]],
    [{ foo: 'bar' }],
    [new Date],
  ])('get value of non-value object objects, like %s', (x) => {
    expect(valueOf(x)).toEqual(x)
  })

  test('value of a typed object', () => {
    let Foo = Type.of()
    let x = Foo.of({ test: 'me' })
    expect(valueOf(x)).toEqual(x)
    expect(Object.getPrototypeOf(valueOf(x))).toBe(Foo)
  })
})

describe('copy', () => {
  test.each([
    [{}],
    [{ foo: 'bar' }],
    [new Date()],
    [[]],
    [[1, 2, 3]],
    [new Set([1, 2])],
    [new Map([['a', 1], ['b', 2]])],
  ])(
    'copy an object like %s',
    x => {
      let y = copy(x)
      expect(y).toEqual(x)
      expect(y).not.toBe(x)
    },
  )

  test.each([
    1,
    true,
    'str',
    null,
    undefined,
    /test/,
    Symbol('me'),
  ])(
    'copy a primitive like %s',
    x => {
      expect(copy(x)).toBe(x)
    },
  )

  test('copy a type', () => {
    let Foo = Type.of()
    let x = Foo.of({ foo: 'bar' })
    let y = copy(x)
    expect(y).not.toBe(x)
    expect(y.foo).toBe('bar')
    expect(Object.getPrototypeOf(y)).toBe(Foo)
  })

  test('copy a value object', () => {
    let Foo = Type.of()
    let x = Foo.val(12)
    let y = copy(x)
    expect(y).not.toBe(x)
    expect(y.value).toBe(12)
    expect(Object.getPrototypeOf(y)).toBe(Foo)
  })

  test('copy value of a custom class', () => {
    class MyClass {
      constructor (x, y) {
        this.x = x
        this.y = y
      }
    }

    let x = new MyClass(1, 2)
    let y = copy(x)

    expect(y).toBe(x)
  })

  test('extend copy for custom class', () => {
    class MyClass {
      constructor (x, y) {
        this.x = x
        this.y = y
      }
    }

    copy.define(MyClass, val => new MyClass(val.x, val.y))

    let x = new MyClass(1, 2)
    let y = copy(x)

    expect(y).not.toBe(x)
    expect(y).toBeInstanceOf(MyClass)
    expect(y.x).toBe(1)
    expect(y.y).toBe(2)

    copy.remove(MyClass)
  })
})

describe('merge', () => {
  test('merge objects', () => {
    let x = { foo: 1 }
    let y = { bar: 2 }
    expect(merge(x, y)).toEqual({ foo: 1, bar: 2 })
  })

  test('merge arrays', () => {
    let x = ['foo']
    let y = ['bar']
    expect(merge(x, y)).toEqual(['foo', 'bar'])
    expect(merge(y, x)).toEqual(['bar', 'foo'])
    expect(merge(x, x)).toEqual(['foo', 'foo'])
  })

  test('merge sets', () => {
    let x = new Set(['foo'])
    let y = new Set(['bar'])
    expect(merge(x, y)).toEqual(new Set(['foo', 'bar']))
    expect(merge(y, x)).toEqual(new Set(['bar', 'foo']))
    expect(merge(x, x)).toEqual(new Set(['foo']))
  })

  test('merge maps', () => {
    let x = new Map([['foo', 1]])
    let y = new Map([['bar', 2]])
    expect(merge(x, y)).toEqual(new Map([['foo', 1], ['bar', 2]]))
    expect(merge(y, x)).toEqual(new Map([['bar', 2], ['foo', 1]]))
    expect(merge(x, x)).toEqual(new Map([['foo', 1]]))
  })

  test('merge numbers', () => {
    let x = 1
    let y = 2
    expect(merge(x, y)).toBe(3)
    expect(merge(y, x)).toBe(3)
    expect(merge(x, x)).toBe(2)
  })

  test('merge strings', () => {
    let x = 'foo'
    let y = 'bar'
    expect(merge(x, y)).toBe('foobar')
    expect(merge(y, x)).toBe('barfoo')
    expect(merge(x, x)).toBe('foofoo')
  })

  test('merge value objects', () => {
    let Foo = Type.of()
    let x = Foo.val(1)
    let y = Foo.val(2)
    expect(Object.getPrototypeOf(merge(x, y))).toBe(Foo)
    expect(merge(x, y)).toEqual(Foo.val(3))
  })

  test('merge typed object', () => {
    let Foo = Type.of()
    let x = Foo.of({ foo: 1 })
    let y = Foo.of({ bar: 2 })
    expect(Object.getPrototypeOf(merge(x, y))).toBe(Foo)
    expect(merge(x, y)).toEqual(Foo.of({ foo: 1, bar: 2 }))
  })

  test('some other values', () => {
    expect(merge(true, false)).toBe(false)
    expect(merge(false, true)).toBe(true)
    expect(merge(true, true)).toBe(true)
    expect(merge(true, undefined)).toBe(undefined)
    expect(merge(null, null)).toBe(null)
  })
})

describe('get', () => {
  test('get a value at specified path from an object', () => {
    let x = { foo: { bar: { baz: 12 } } }
    expect(get(['foo', 'bar', 'baz'], x)).toBe(12)
  })

  test('get array members', () => {
    let x = { foo: { bar: [{ baz: 12 }, { baz: 14 }] } }
    expect(get(['foo', 'bar', 1, 'baz'], x)).toBe(14)
  })

  test('return undefined for missing member', () => {
    let x = { foo: {} }
    expect(get(['foo', 'bar'], x)).toBe(undefined)
  })

  test('return undefined if value is undefined', () => {
    expect(get(['foo', 'bar'], undefined)).toBe(undefined)
  })
})

describe('patch', () => {
  test('assign to a path within the object', () => {
    let x = { foo: { bar: 1, baz: 2 } }
    let v = ['foo', 'bar', 2]
    let y = patch(v, x)
    expect(y).toEqual({ foo: { bar: 2, baz: 2 } })
  })

  test('assign to a non-existent path', () => {
    let x = {}
    let v = ['foo', 'bar', 2]
    let y = patch(v, x)
    expect(y).toEqual({ foo: { bar: 2 } })
  })

  test.only('assign to a non-existent array index', () => {
    let x = {}

    let y = patch(['foo', 1, 'bar', 2], x)
    expect(y).toEqual({ foo: [undefined, { bar: 2 }] })

    let z = patch(['foo', 'bar', 1, 2], x)
    expect(z).toEqual({ foo: { bar: [undefined, 2] } })
  })

  test('append to a path', () => {
    let x = { foo: { bar: 1, baz: 2 } }
    let v = ['foo', 'bar', Append.val(2)]
    let y = patch(v, x)
    expect(y).toEqual({ foo: { bar: [1, 2], baz: 2 } })
  })

  test('append to an existing path that is an array', () => {
    let x = { foo: { bar: [1], baz: 2 } }
    let v = ['foo', 'bar', Append.val(2)]
    let y = patch(v, x)
    expect(y).toEqual({ foo: { bar: [1, 2], baz: 2 } })
  })

  test('append to a non-existing path', () => {
    let x = {}
    let v = ['foo', 'bar', Append.val(2)]
    let y = patch(v, x)
    expect(y).toEqual({ foo: { bar: 2 } })
  })

  test('map over a value', () => {
    let x = { foo: { bar: false } }
    let v = ['foo', 'bar', Call.val(x => !x)]
    let y = patch(v, x)
    expect(y).toEqual({ foo: { bar: true } })
  })

  test('assign to array', () => {
    let x = [{ foo: 1 }, { foo: 2 }, { foo: 3 }]
    let v = [2, 'foo', 4]
    let y = patch(v, x)
    expect(y).toEqual([{ foo: 1 }, { foo: 2 }, { foo: 4 }])
  })

  test('assign to nested array', () => {
    let x = { foo: [{ bar: [1, 2] }, { bar: [3, 4] }] }
    let v = ['foo', 1, 'bar', Call.val(x => x.map(n => n + 1))]
    let y = patch(v, x)
    expect(y).toEqual({ foo: [{ bar: [1, 2] }, { bar: [4, 5] }] })
  })

  test('assign on a value object', () => {
    let Foo = Type.of()
    let x = Foo.val({ foo: { bar: 1, baz: 2 } })
    let v = ['foo', 'bar', 2]
    let y = patch(v, x)
    expect(Object.getPrototypeOf(y)).toBe(Foo)
    expect(y.value).toEqual({ foo: { bar: 2, baz: 2 } })
  })

  test('assign on a property that is a value object', () => {
    let Foo = Type.of()
    let x = { foo: Foo.val({ bar: 1, baz: 2 }) }
    let v = ['foo', 'bar', 2]
    let y = patch(v, x)
    expect(Object.getPrototypeOf(y.foo)).toBe(Foo)
    expect(y).toEqual({ foo: Foo.val({ bar: 2, baz: 2 }) })
  })

  test('assign on a typed object', () => {
    let Foo = Type.of()
    let x = Foo.of({ foo: { bar: 1, baz: 2 } })
    let v = ['foo', 'bar', 2]
    let y = patch(v, x)
    expect(Object.getPrototypeOf(y)).toBe(Foo)
    expect(y).toEqual({ foo: { bar: 2, baz: 2 } })
  })

  test('assign over a property that is a typed object', () => {
    let Foo = Type.of()
    let x = { foo: Foo.of({ bar: 1, baz: 2 }) }
    let v = ['foo', 'bar', 2]
    let y = patch(v, x)
    expect(Object.getPrototypeOf(y.foo)).toBe(Foo)
    expect(y).toEqual({ foo: Foo.of({ bar: 2, baz: 2 }) })
  })

  test('assign over a property that is a typed object and has a value property', () => {
    let Foo = Type.of()
    let x = { foo: Foo.of({ bar: 1, baz: 2, value: 0 }) }
    let v = ['foo', 'bar', 2]
    let y = patch(v, x)
    expect(Object.getPrototypeOf(y.foo)).toBe(Foo)
    expect(y).toEqual({ foo: Foo.of({ bar: 2, baz: 2, value: 0 }) })
  })

  test('merge objects', () => {
    let x = { foo: { bar: { baz: 1 } } }
    let v = ['foo', 'bar', Merge.val({ qux: 2 })]
    let y = patch(v, x)
    expect(y).toEqual({ foo: { bar: { baz: 1, qux: 2 } } })
  })

  test('merge with non-existent value', () => {
    let x = {}
    let v = ['foo', 'bar', Merge.val({ qux: 2 })]
    let y = patch(v, x)
    expect(y).toEqual({ foo: { bar: { qux: 2 } } })
  })

  test('assign to a path that is a value object', () => {
    let Foo = Type.of()
    let x = { foo: { bar: Foo.val({ baz: 2 }) } }
    let v = ['foo', 'bar', 'baz', 3]
    let y = patch(v, x)
    expect(Object.getPrototypeOf(y.foo.bar)).toBe(Foo)
    expect(y.foo.bar.value).toEqual({ baz: 3 })
  })

  test('replace a leaf value object with another value object', () => {
    let Foo = Type.of()
    let Bar = Type.of()
    let x = { foo: { bar: Foo.val(2) } }
    let v = ['foo', 'bar', Bar.val(3)]
    let y = patch(v, x)
    expect(Object.getPrototypeOf(y.foo.bar)).toBe(Bar)
    expect(y.foo.bar.value).toBe(3)
  })

  test('assign to a path that is inside a typed object', () => {
    let Foo = Type.of()
    let x = { foo: { bar: Foo.of({ baz: 2 }) } }
    let v = ['foo', 'bar', 'baz', 3]
    let y = patch(v, x)
    expect(Object.getPrototypeOf(y.foo.bar)).toBe(Foo)
    expect(y.foo.bar).toEqual({ baz: 3 })
  })

  test('assign the exact same value returns the source object', () => {
    let x = { foo: { bar: 'baz' } }
    let v = ['foo', 'bar', 'baz']
    let y = patch(v, x)
    expect(x).toBe(y)
  })

  test('assign the exact same value using a Call', () => {
    let x = { foo: { bar: 'baz' } }
    let v = ['foo', 'bar', Call.val(id)]
    let y = patch(v, x)
    expect(x).toBe(y)
  })

  test('assign asynchronously using AsyncCall', done => {
    let x = { foo: { bar: 'baz' } }
    let v = ['foo', 'bar', AsyncCall.val(x => Promise.resolve('qux'))]
    let y = patch(v, x)
    expect(y).toBeInstanceOf(Promise)
    y.then(y => {
      expect(y).toEqual({ foo: { bar: 'qux' } })
      expect(y).not.toBe(x)
      done()
    })
  })

  test('delete a property', () => {
    let x = { foo: { bar: 'baz' } }
    let v = ['foo', 'bar', Delete]
    let y = patch(v, x)
    expect(y).toEqual({ foo: {} })
  })
})

describe('partial', () => {
  test('partially apply a function', () => {
    let f = (x, y, z) => x + y + z
    let g = partial(f, 1, 2)
    expect(g(3)).toBe(6)
  })

  test('partially apply a function with no args', () => {
    let f = () => 'value'
    let g = partial(f)
    expect(g(1, 2, 3)).toBe('value')
  })
})

describe('tap', () => {
  test('call a function and return original value', () => {
    let f = jest.fn()
    let r = tap(f, 'value')
    expect(r).toBe('value')
    expect(f).toHaveBeenCalledWith('value')
  })
})

describe('log', () => {
  test('log a value and return it', () => {
    jest.spyOn(console, 'log')
    let x = log('test')
    expect(x).toBe('test')
    expect(console.log).toHaveBeenCalledWith('test')
    console.log.mockRestore()
  })
})

describe('using', () => {
  test('call a function with a set of expressions', () => {
    let f = jest.fn((x, y, z) => x + y + z)
    let x = using([1, 2, 3], f)
    expect(f).toHaveBeenCalledWith(1, 2, 3)
    expect(x).toBe(6)
  })
})
