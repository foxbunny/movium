import { h } from 'snabbdom'
import { renderToDOM } from '../__test__/snabbdom'

describe.each([
  'onOutside',
  'onDocument',
  'onWindow',
])(
  'event using %s',
  (property) => {
    afterEach(() => {
      document.body.innerHTML = ''
    })

    test('handle an event on the outside element', () => {
      let handler = jest.fn()
      let inside = h('div.inside', { [property]: { click: handler } })
      let vnode = h('div.outside', [inside])
      renderToDOM(vnode, document.body)
      let event = new Event('click', { bubbles: true })
      vnode.elm.dispatchEvent(event)
      expect(handler).toHaveBeenCalledWith(event, inside)
    })

    test('handle event on document body', () => {
      let handler = jest.fn()
      let inside = h('div.inside', { [property]: { click: handler } })
      let vnode = h('div.outside', [inside])
      renderToDOM(vnode, document.body)
      let event = new Event('click', { bubbles: true })
      document.body.dispatchEvent(event)
      expect(handler).toHaveBeenCalledWith(event, inside)
    })

    test('remove handler', () => {
      let handler = jest.fn()
      let vnode1 = h('div.outside', [
        h('div.inside', { [property]: { click: handler } }),
      ])
      let vnode2 = h('div.outside', [
        h('div.inside'),
      ])
      let { patch } = renderToDOM(vnode1, document.body)
      patch(vnode1, vnode2)
      let event = new Event('click', { bubbles: true })
      document.body.dispatchEvent(event)
      expect(handler).not.toHaveBeenCalled()
    })

    test('remove some of the handlers', () => {
      let handler = jest.fn()
      let vnode1 = h('div.outside', [
        h('div.inside', { [property]: { click: handler, keyup: handler } }),
      ])
      let vnode2 = h('div.outside', [
        h('div.inside', { [property]: { keyup: handler } }),
      ])
      let { patch } = renderToDOM(vnode1, document.body)
      patch(vnode1, vnode2)
      document.body.dispatchEvent(new Event('click', { bubbles: true }))
      document.body.dispatchEvent(new Event('keyup', { bubbles: true }))
      expect(handler).toHaveBeenCalledTimes(1)
    })

    test('add additional handlers', () => {
      let handler = jest.fn()
      let vnode1 = h('div.outside', [
        h('div.inside', { [property]: { keyup: handler } }),
      ])
      let vnode2 = h('div.outside', [
        h('div.inside', { [property]: { click: handler, keyup: handler } }),
      ])
      let { patch } = renderToDOM(vnode1, document.body)
      patch(vnode1, vnode2)
      document.body.dispatchEvent(new Event('click', { bubbles: true }))
      document.body.dispatchEvent(new Event('keyup', { bubbles: true }))
      expect(handler).toHaveBeenCalledTimes(2)
    })

    test('add multiple handlers for the same event', () => {
      let handler1 = jest.fn()
      let handler2 = jest.fn()
      let inside = h('div.inside', { [property]: { click: [handler1, handler2] } })
      let vnode = h('div.outside', [inside])
      renderToDOM(vnode, document.body)
      let event = new Event('click', { bubbles: true })
      vnode.elm.dispatchEvent(event)
      expect(handler1).toHaveBeenCalledWith(event, inside)
      expect(handler2).toHaveBeenCalledWith(event, inside)
    })

    test('add empty array for event', () => {
      let inside = h('div.inside', { [property]: { click: [] } })
      let vnode = h('div.outside', [inside])
      renderToDOM(vnode, document.body)
      let event = new Event('click', { bubbles: true })
      vnode.elm.dispatchEvent(event)
    })

    test('no longer registers after node removal', () => {
      let handler = jest.fn()
      let inside = h('div.inside', { [property]: { click: handler } })
      let vnode1 = h('div.outside', [inside])
      let vnode2 = h('div.outside', [])
      let { elm, patch } = renderToDOM(vnode1, document.body)
      patch(vnode1, vnode2)
      let event = new Event('click', { bubbles: true })
      elm.dispatchEvent(event)
      expect(handler).not.toHaveBeenCalled()
    })
  })

describe('documentEventListeners', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('handles events on self', () => {
    let handler = jest.fn()
    let inside = h('div.inside', { onDocument: { click: handler } })
    let vnode = h('div.outside', [inside])
    renderToDOM(vnode, document.body)
    let event = new Event('click', { bubbles: true })
    inside.elm.dispatchEvent(event)
    expect(handler).toHaveBeenCalledWith(event, inside)
  })
})

describe('outsideEventListeners', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('do not handle events on self', () => {
    let handler = jest.fn()
    let inside = h('div.inside', { onOutside: { click: handler } })
    let vnode = h('div.outside', [inside])
    renderToDOM(vnode, document.body)
    let event = new Event('click', { bubbles: true })
    inside.elm.dispatchEvent(event)
    expect(handler).not.toHaveBeenCalled()
  })
})
