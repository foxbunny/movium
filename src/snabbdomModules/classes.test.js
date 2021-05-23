import { h } from 'snabbdom'
import { renderToDOM } from '../__test__/snabbdom'
import { pause } from '../__test__/timing'
import { render } from '../framework'

describe('classes', () => {
  test('add normal classes', () => {
    let vnode = h('div', { class: { myClass: true } })
    let { elm } = renderToDOM(vnode)
    expect(elm.className).toBe('myClass')
  })

  test('add multiple classes', () => {
    let vnode = h('div', { class: { myClass: true, myOtherClass: true } })
    let { elm } = renderToDOM(vnode)
    expect(elm.className).toBe('myClass myOtherClass')
  })

  test('add disabled class', () => {
    let vnode = h('div', { class: { myClass: false } })
    let { elm } = renderToDOM(vnode)
    expect(elm.className).toBe('')
  })

  test('cached classes will not cause an update', () => {
    let cachedClasses = { myClass: true }
    let vnode1 = h('div', { class: cachedClasses })
    let vnode2 = h('div', { class: cachedClasses })
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(elm.className).toBe('myClass')
  })

  test('nothing happens if vnodes do not have classes', () => {
    let vnode1 = h('div')
    let vnode2 = h('div')
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(elm.className).toBe('')
  })

  test('remove class', () => {
    let vnode1 = h('div', { class: { myClass: true } })
    let vnode2 = h('div')
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(elm.className).toBe('')
  })

  test('disable classes', () => {
    let vnode1 = h('div', { class: { myClass: true } })
    let vnode2 = h('div', { class: { myClass: false } })
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(elm.className).toBe('')
  })

  test('toggle some of the classes', () => {
    let vnode1 = h('div', { class: { myClass: true, myOtherClass: true } })
    let vnode2 = h('div', { class: { myClass: false, myOtherClass: true } })
    let vnode3 = h('div', { class: { myClass: true, myOtherClass: false } })
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(elm.className).toBe('myOtherClass')
    patch(vnode2, vnode3)
    expect(elm.className).toBe('myClass')
  })

  test('add delayed class', (done) => {
    let vnode = h('div', { class: { myClass: true, delayed: { myDelayedClass: true } } })
    let { elm } = renderToDOM(vnode)
    expect(elm.className).toBe('myClass')
    requestAnimationFrame(() => {
      expect(elm.className).toBe('myClass myDelayedClass')
      done()
    })
  })

  test('add delayed class on later update', (done) => {
    let vnode1 = h('div', { class: { myClass: true } })
    let vnode2 = h('div', { class: { myClass: true, delayed: { myDelayedClass: true } } })
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    requestAnimationFrame(() => {
      expect(elm.className).toBe('myClass myDelayedClass')
      done()
    })
  })

  test('toggle delayed class', (done) => {
    let vnode1 = h('div', { class: { myClass: true, delayed: { myDelayedClass: true } } })
    let vnode2 = h('div', { class: { myClass: true, delayed: { myDelayedClass: false } } })
    let { elm, patch } = renderToDOM(vnode1)
    requestAnimationFrame(() => {
      patch(vnode1, vnode2)
      expect(elm.className).toBe('myClass myDelayedClass')
      requestAnimationFrame(() => {
        expect(elm.className).toBe('myClass')
        done()
      })
    })
  })

  test('add class on destroy', () => {
    let vnode1 = h('div.parent', {}, [
      h('span', { key: 1, class: { myClass: true, destroy: { myDestroyClass: true } } }),
    ])
    let vnode2 = h('div.parent', {}, [null])
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(vnode1.children[0].elm.className).toBe('myClass myDestroyClass')
    expect(elm.firstChild).toBe(null)  // removed
  })

  test('remove class on destroy', () => {
    let vnode1 = h('div.parent', {}, [
      h('span', { key: 1, class: { myClass: true, destroy: { myClass: false } } }),
    ])
    let vnode2 = h('div.parent', {}, [null])
    let { patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(vnode1.children[0].elm.className).toBe('')
  })

  test('add class on remove', () => {
    let vnode1 = h('div.parent', {}, [
      h('span', { key: 1, class: { myClass: true, remove: { myRemoveClass: true } } }),
    ])
    let vnode2 = h('div.parent', {}, [null])
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(elm.firstChild).toBe(vnode1.children[0].elm) // still there
    expect(vnode1.children[0].elm.className).toBe('myClass myRemoveClass')
    vnode1.children[0].elm.dispatchEvent(new Event('transitionend'))
    expect(elm.firstChild).toBe(null)
  })

  test('add class on remove and react to animationend', () => {
    let vnode1 = h('div.parent', {}, [
      h('span', { key: 1, class: { myClass: true, remove: { myRemoveClass: true } } }),
    ])
    let vnode2 = h('div.parent', {}, [null])
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(elm.firstChild).toBe(vnode1.children[0].elm) // still there
    expect(vnode1.children[0].elm.className).toBe('myClass myRemoveClass')
    vnode1.children[0].elm.dispatchEvent(new Event('animationend'))
    expect(elm.firstChild).toBe(null)
  })

  test('remove class on remove', () => {
    let vnode1 = h('div.parent', {}, [
      h('span', { key: 1, class: { myClass: true, remove: { myClass: false } } }),
    ])
    let vnode2 = h('div.parent', {}, [null])
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(elm.firstChild).toBe(vnode1.children[0].elm) // still there
    expect(vnode1.children[0].elm.className).toBe('')
    vnode1.children[0].elm.dispatchEvent(new Event('transitionend'))
    expect(elm.firstChild).toBe(null)
  })

  test('remove immediately when removed class was not there', () => {
    let vnode1 = h('div.parent', {}, [
      h('span', { key: 1, class: { myClass: false, remove: { myClass: false } } }),
    ])
    let vnode2 = h('div.parent', {}, [null])
    let { elm, patch } = renderToDOM(vnode1)
    patch(vnode1, vnode2)
    expect(elm.firstChild).toBe(null) // removed
  })
})
