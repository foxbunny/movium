import { Msg } from './framework'
import { Append, assignPath, Call, copy, removeAtPath, valueOf } from './tools'
import { val } from './types'

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

  test('get value of non-value object objects', () => {
    for (let x of [[1, 2, 3], { foo: 'bar' }, new Date])
      expect(valueOf(x)).toEqual(x)
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
})

describe('assignPath', () => {
  test('assign to a path within the object', () => {
    let x = { foo: { bar: 1, baz: 2 } }
    let v = ['foo', 'bar', 2]
    let y = assignPath(v, x)
    expect(y).toEqual({ foo: { bar: 2, baz: 2 } })
  })

  test('assign to a non-existent path', () => {
    let x = {}
    let v = ['foo', 'bar', 2]
    let y = assignPath(v, x)
    expect(y).toEqual({ foo: { bar: 2 } })
  })

  test('append to a path', () => {
    let x = { foo: { bar: 1, baz: 2 } }
    let v = ['foo', 'bar', Append.val(2)]
    let y = assignPath(v, x)
    expect(y).toEqual({ foo: { bar: [1, 2], baz: 2 } })
  })

  test('append to an existing path that is an array', () => {
    let x = { foo: { bar: [1], baz: 2 } }
    let v = ['foo', 'bar', Append.val(2)]
    let y = assignPath(v, x)
    expect(y).toEqual({ foo: { bar: [1, 2], baz: 2 } })
  })

  test('append to a non-existing path', () => {
    let x = {}
    let v = ['foo', 'bar', Append.val(2)]
    let y = assignPath(v, x)
    expect(y).toEqual({ foo: { bar: 2 } })
  })

  test('map over a value', () => {
    let x = { foo: { bar: false } }
    let v = ['foo', 'bar', Call.val(x => !x)]
    let y = assignPath(v, x)
    expect(y).toEqual({ foo: { bar: true } })
  })

  test('assign to array', () => {
    let x = [{ foo: 1 }, { foo: 2 }, { foo: 3 }]
    let v = [2, 'foo', 4]
    let y = assignPath(v, x)
    expect(y).toEqual([{ foo: 1 }, { foo: 2 }, { foo: 4 }])
  })

  test('assign to nested array', () => {
    let x = { foo: [{ bar: [1, 2] }, { bar: [3, 4] }] }
    let v = ['foo', 1, 'bar', Call.val(x => x.map(n => n + 1))]
    let y = assignPath(v, x)
    expect(y).toEqual({ foo: [{ bar: [1, 2] }, { bar: [4, 5] }] })
  })
})
