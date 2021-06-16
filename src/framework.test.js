import { delegate, inMsgs, isMsg, Msg, render, scope, Task } from './framework'
import { div, onClick } from './html'
import { match, when } from './patternMatching'
import { id } from './tools'

describe('scope', () => {
  test('create a scoped view', () => {
    let MyMsg = Msg.of()
    let update = () => {}
    let f = x => () => `<html>${x}</html>`
    let g = scope(MyMsg, f('hello'))
    expect(g(update)).toBe('<html>hello</html>')
  })

  test('wrap event in a message', () => {
    let MyMsg = Msg.of()
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
    let MyMsg = Msg.of()
    let update = jest.fn()
    let f = x => update => {
      update('hello from view')
      return `<html>${x}</html>`
    }
    let g = scope(m => MyMsg.val({ myMsg: m }), f('hello'))
    let r = g(update)
    let msg = update.mock.calls[0][0]
    expect(r).toBe('<html>hello</html>')
    expect(MyMsg.isPrototypeOf(msg)).toBe(true)
    expect(msg.value).toEqual({ myMsg: 'hello from view' })
  })
})

describe('render', () => {
  let updateDetectorModule = {
    update: jest.fn(),
  }

  afterEach(() => {
    updateDetectorModule.update.mockClear()
  })

  test('first render', done => {
    let root = document.createElement('div')

    let init = () => 'model'
    let update = jest.fn((msg, model) => model)
    let view = jest.fn(model => (
      div([], 'Hello, test')
    ))

    render(root, init, update, view)

    requestAnimationFrame(() => {
      expect(root.outerHTML).toBe('<div>Hello, test</div>')
      done()
    })
  })

  test('catch errors while rendering', done => {
    let root = document.createElement('div')

    jest.spyOn(console, 'trace')

    let init = () => 'model'
    let err = Error('OMG!')
    let update = jest.fn((msg, model) => model)
    let view = jest.fn(model => {
      throw err
    })

    render(root, init, update, view)

    requestAnimationFrame(() => {
      // Did not throw and break the test
      expect(console.trace).toHaveBeenCalledWith(err)
      console.trace.mockRestore()
      done()
    })
  })

  test('catch error during message handling', done => {
    let root = document.createElement('div')

    jest.spyOn(console, 'trace')

    let init = () => 'model'
    let err = Error('OMG!')
    let update = jest.fn((msg, model) => {
      throw err
    })
    let view = jest.fn(() => (
      div([onClick({})], 'Click here')
    ))

    render(root, init, update, view)

    requestAnimationFrame(() => {
      // Did not throw and break the test
      root.click()
      expect(console.trace).toHaveBeenCalledWith(err)
      console.trace.mockRestore()
      done()
    })
  })

  test('warn if message is emitted while still rendering', done => {
    let root = document.createElement('div')

    jest.spyOn(console, 'error')
    jest.spyOn(console, 'trace')

    let init = () => 'model'
    let update = jest.fn((msg, model) => model)
    let view = jest.fn(model => (
      div([update => update('nope')], 'Hello, test')
    ))

    render(root, init, update, view)

    requestAnimationFrame(() => {
      expect(console.error).toHaveBeenCalledWith('nope')
      expect(console.trace)
        .toHaveBeenCalledWith(Error('Message received during rendering. Are you updating from a hook without using nextFrame()?'))
      console.error.mockRestore()
      console.trace.mockRestore()
      done()
    })
  })

  test('update the view', done => {
    let root = document.createElement('div')

    let init = () => 'model'
    let MyMsg = Msg.of()
    let update = jest.fn((msg, model) => match(msg,
      when(MyMsg, id),
    ))
    let view = jest.fn(model => (
      div([onClick(MyMsg, () => 'updated')], `Hello, ${model}`)
    ))

    render(root, init, update, view)

    requestAnimationFrame(() => {
      expect(root.outerHTML).toBe('<div>Hello, model</div>')
      root.click()
      requestAnimationFrame(() => {
        expect(root.outerHTML).toBe('<div>Hello, updated</div>')
        done()
      })
    })
  })

  test('do not re-render if model is the same as before', done => {
    let root = document.createElement('div')

    let init = () => 'model'
    let MyMsg = Msg.of({ testLabel: 'test' })
    let update = jest.fn((msg, model) => model)
    let view = jest.fn(() => (
      div([onClick(MyMsg)], 'Hello, test')
    ))

    render(root, init, update, view, [updateDetectorModule])

    requestAnimationFrame(() => {
      updateDetectorModule.update.mockClear()
      root.click()
      requestAnimationFrame(() => {
        expect(updateDetectorModule.update).not.toHaveBeenCalled()
        done()
      })
    })
  })

  test('handle tasks', done => {
    let root = document.createElement('div')

    let init = () => 'initial'
    let MyMsg = Msg.of({ testLabel: 'test' })
    let Finish = Msg.of({ testLabel: 'finish' })
    let update = jest.fn((msg, model) => match(msg,
      when(MyMsg, () => Task.from(
        'updating',
        Promise.resolve('done'),
        Finish,
      )),
      when(Finish, id),
    ))
    let view = jest.fn(model => (
      div([onClick(MyMsg)], `Hello, ${model}`)
    ))

    render(root, init, update, view, [updateDetectorModule])

    requestAnimationFrame(() => {
      expect(root.outerHTML).toBe('<div>Hello, initial</div>')
      root.click()
      requestAnimationFrame(() => {
        expect(root.outerHTML).toBe('<div>Hello, updating</div>')
        new Promise(res => setTimeout(res)).then(() => {
          requestAnimationFrame(() => {
            expect(root.outerHTML).toBe('<div>Hello, done</div>')
            done()
          })
        })
      })
    })
  })

  test('handle promise rejection in task', done => {
    let root = document.createElement('div')

    let init = () => 'initial'
    let MyMsg = Msg.of({ testLabel: 'test' })
    let Finish = Msg.of({ testLabel: 'finish' })
    let update = jest.fn((msg, model) => match(msg,
      when(MyMsg, () => Task.from(
        'updating',
        (() => {
          // This is a workaround for a Jest bug.
          // See https://github.com/facebook/jest/issues/6028
          // and in particular this comment:
          // https://github.com/facebook/jest/issues/6028#issuecomment-806967164
          let p = Promise.reject(Error('OMG!'))
          p.catch(() => {})
          return p
        })(),
        Finish,
      )),
      when(Finish, x => x instanceof Error ? 'failure' : 'done'),
    ))
    let view = jest.fn(model => (
      console.log('model', model) ||
      div([onClick(MyMsg)], `Hello, ${model}`)
    ))

    render(root, init, update, view, [updateDetectorModule])

    requestAnimationFrame(() => {
      expect(root.outerHTML).toBe('<div>Hello, initial</div>')
      root.click()
      requestAnimationFrame(() => {
        expect(root.outerHTML).toBe('<div>Hello, updating</div>')
        new Promise(res => setTimeout(res)).then(() => {
          requestAnimationFrame(() => {
            expect(root.outerHTML).toBe('<div>Hello, failure</div>')
            done()
          })
        })
      })
    })
  })

  test('update after identical model is returned in an update', done => {
    let root = document.createElement('div')

    let init = () => 'model'
    let MyMsg = Msg.of({ testLabel: 'test' })
    let clicks = 0
    let update = jest.fn((msg, model) => !(clicks++) ? model : 'updated')
    let view = jest.fn(() => (
      div([onClick(MyMsg)], 'Hello, test')
    ))

    render(root, init, update, view, [updateDetectorModule])

    requestAnimationFrame(() => {
      updateDetectorModule.update.mockClear()
      root.click()
      requestAnimationFrame(() => {
        expect(updateDetectorModule.update).not.toHaveBeenCalled()
        root.click()
        requestAnimationFrame(() => {
          expect(updateDetectorModule.update).toHaveBeenCalled()
          done()
        })
      })
    })
  })
})

describe('isMsg', () => {
  test('check if a message is of a message prototype', () => {
    let Msg1 = Msg.of()
    let m = Msg1.val('foo')

    expect(isMsg(Msg1, m)).toBe(true)
  })

  test('check if the message proto is an ancestor', () => {
    let Msg1 = Msg.of()
    let m1 = Msg1.val('foo')
    let m2 = m1.val('foo')

    expect(isMsg(Msg1, m2)).toBe(true)
  })

  test('check if value has a proto', () => {
    let Msg1 = Msg.of()
    let Msg2 = Msg.of()
    let m1 = Msg1.val('foo')
    let m2 = Msg2.val(m1)

    expect(isMsg(Msg1, m2)).toBe(true)
  })

  test('check if the object has a msg property which matches', () => {
    let Msg1 = Msg.of()
    let Msg2 = Msg.of()
    let m1 = Msg1.val('foo')
    let m2 = Msg2.val({ msg: m1 })

    expect(isMsg(Msg1, m2)).toBe(true)
  })
})

describe('inMsgs', () => {
  test('check if message is one of the specified', () => {
    let Msg1 = Msg.of()
    let Msg2 = Msg.of()
    let Msg3 = Msg.of()

    let m1 = Msg1.of()
    let m2 = Msg3.of()

    isMsg(Msg1, m1) //?

    expect(inMsgs([Msg1, Msg2], m1)).toBe(true)
    expect(inMsgs([Msg1, Msg2], m2)).toBe(false)
  })

  test('check nested messages', () => {
    let Msg1 = Msg.of()
    let Msg2 = Msg.of()

    let m = Msg2.val(Msg1.val('test'))

    expect(inMsgs([Msg1], m)).toBe(true)
  })
})

describe('Task', () => {
  test('delegate a task', done => {
    let Foo = Msg.of()
    let Bar = Msg.of()
    let t1 = Task.from({ foo: 'bar' }, Promise.resolve('someValue'), Foo)
    let t2 = Task.delegate(foo => ({ bar: foo }), Bar, t1)
    expect(t2.model).toEqual({ bar: { foo: 'bar' } })
    expect(t2.msg).toBe(Bar)
    t2.work.then(result => {
      expect(result).toEqual(Foo.val('someValue'))
      done()
    })
  })
})

describe('delegate', () => {
  let Foo = Msg.of()
  let Bar = Msg.of()
  let fn = foo => ({ bar: foo })

  test('delegate when value is a model', () => {
    let val = { foo: 'bar' }
    let r = delegate(fn, Bar, val)
    expect(r).toEqual({ bar: { foo: 'bar' } })
  })

  test('delegate when value is a task', done => {
    let val = Task.from({ foo: 'bar' }, Promise.resolve('someValue'), Foo)
    let r = delegate(fn, Bar, val)
    expect(Object.getPrototypeOf(r)).toBe(Task)
    expect(r.model).toEqual({ bar: { foo: 'bar' } })
    expect(r.msg).toBe(Bar)
    r.work.then(result => {
      expect(result).toEqual(Foo.val('someValue'))
      done()
    })
  })
})
