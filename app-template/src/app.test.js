import { render } from 'movium'
import * as app from './app'

describe('model', () => {
  test('init', () => {
    expect(app.init()).toBe('Movium')
  })
})

describe('update', () => {
  test('SetName', () => {
    let model = app.init()
    let msg = app.SetName.val('world')

    let updated = app.update(msg, model)

    expect(updated).toBe('world')
  })
})

describe('view', () => {
  test('default view', done => {
    let root = document.createElement('div')

    render(root, app.init, app.update, app.view)

    requestAnimationFrame(() => {
      expect(root).toMatchSnapshot()
      done()
    })
  })

  test('edit the text', done => {
    let root = document.createElement('div')

    jest.spyOn(app, 'update')

    render(root, app.init, app.update, app.view)

    requestAnimationFrame(() => {
      let input = root.querySelector('input')
      input.value = 'test'
      input.dispatchEvent(new Event('input'))

      expect(app.update).toHaveBeenCalledWith(app.SetName.val('input'), 'Movium')

      app.update.mockRestore()
      done()
    })
  })
})

