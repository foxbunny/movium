import { Msg, scope } from './framework'
import { subtype, valueObj } from './types'

describe('scope', () => {
  test('create a scoped view', () => {
    let MyMsg = subtype(Msg)
    let update = () => {}
    let f = x => () => `<html>${x}</html>`
    let g = scope(MyMsg, f('hello'))
    expect(g(update)).toBe('<html>hello</html>')
  })

  test('wrap event in a message', () => {
    let MyMsg = subtype(Msg)
    let update = jest.fn()
    let f = x => update => {
      update('hello from view')
      return `<html>${x}</html>`
    }
    let g = scope(MyMsg, f('hello'))
    let r = g(update)
    let msg = update.mock.calls[0][0]
    expect(r).toBe('<html>hello</html>')
    expect(MyMsg.isPrototypeOf(msg)).toBe(true)
    expect(msg.value).toBe('hello from view')
  })

  test('process the message before wrapping', () => {
    let MyMsg = subtype(Msg)
    let update = jest.fn()
    let f = x => update => {
      update('hello from view')
      return `<html>${x}</html>`
    }
    let g = scope(m => valueObj(MyMsg, { myMsg: m }), f('hello'))
    let r = g(update)
    let msg = update.mock.calls[0][0]
    expect(r).toBe('<html>hello</html>')
    expect(MyMsg.isPrototypeOf(msg)).toBe(true)
    expect(msg.value).toEqual({ myMsg: 'hello from view' })
  })
})
