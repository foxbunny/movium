import { match, through, when, whenElse, whenRaw } from './patternMatching'
import { id } from './tools'
import { Type } from './types'

describe('pattern matching', () => {
  test('match one of the patterns', () => {
    expect(match([1, 2],
      when(Array, x => x[1]),
      when(Number, id),
    )).toBe(2)

    expect(match(10,
      when(Array, x => x[1]),
      when(Number, id),
    )).toBe(10)
  })

  test('match no parameters', () => {
    expect(() => match('str',
      when(Array, x => x[1]),
      when(Number, id),
    )).toThrow('No match for str')
  })

  test('raw match', () => {
    let X = Type.of()
    expect(match(X.val(12),
      whenRaw(X, id)
    )).toEqual(X.val(12))
  })

  test('match else case', () => {
    expect(match([1, 2],
      when(Array, x => x[1]),
      whenElse(id),
    )).toBe(2)

    expect(match(3,
      when(Array, x => x[1]),
      whenElse(x => x + 1),
    )).toBe(4)
  })

  test('pass-through clause', () => {
    expect(match([1, 2],
      when(Array, x => x[1]),
      through,
    )).toBe(2)

    expect(match(3,
      when(Array, x => x[1]),
      through,
    )).toBe(3)

  })
})
