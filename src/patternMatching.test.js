import { match, when } from './patternMatching'
import { id } from './tools'

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
})
