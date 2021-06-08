import { eventListenersModule, init as initPatch, propsModule, styleModule } from 'snabbdom'
import { match, when, whenRaw } from './patternMatching'
import { classModule } from './snabbdomModules/classes'
import {
  documentEventListeners,
  outsideEventListeners,
  windowEventListeners,
} from './snabbdomModules/specialEventListeners'
import { id, valueOf } from './tools'
import { Any, is, Type, val } from './types'

let Msg = Type.of()
let Task = Type.of({
  from: (model, work, msg) => Task.of({ model, work, msg }),
  delegate: (f, msg, t) => Task.from(f(t.model), t.work.then(result => val(t.msg, result)), msg),
})
let delegate = (f, msg, modelOrTask) => match(modelOrTask,
  when(Task, t => Task.delegate(f, msg, t)),
  when(Any, () => f(modelOrTask)),
)

// Update :: (Msg, Model) -> (Model | Task)
// Updater :: Msg -> HTMLElement
// View :: Updater -> HTMLElement

// ((T | (T -> T)), View) -> View
let scope = (proto, view) => update =>
  view(msg => update(typeof proto === 'function' ? proto(msg) : val(proto, msg)))

// (Msg, Msg) -> True
let isMsg = (proto, x) => x != null && (is(proto, valueOf(x)) || isMsg(proto, valueOf(x)?.msg))
let inMsgs = (protoList, x) => protoList.some(t => isMsg(t, x))

// (HTMLElement, (-> Model), Update, View, SnabbdomModule[]) -> Void
let render = (rootNode, init, update, view, snabbdomModules = []) => {
  let patch = initPatch([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    outsideEventListeners,
    documentEventListeners,
    windowEventListeners,
    ...snabbdomModules,
  ])

  let oldVnode = rootNode
  let model = null
  let rendering = false
  let updateQueue = []
  let renderView = (newModel) => {
    // Render the view on next frame to avoid recursion due to synchronous
    // execution.
    requestAnimationFrame(() => {
      rendering = true
      newModel = match(newModel,
        when(Task, t => {
          t.work
            .then(
              x => updater(val(t.msg, x)),
              e => updater(val(t.msg, e)),
            )
          return t.model
        }),
        whenRaw(Any, id),
      )

      if (newModel !== model) {
        model = newModel

        try {
          let newVnode = view(model)(updater)
          patch(oldVnode, newVnode)
          oldVnode = newVnode
        } catch (e) {
          console.error(`Error ${e} while rendering`)
          console.trace(e)
        }
      }

      rendering = false
    })
  }
  let updater = msg => {
    console.log('Receive message')
    if (rendering) {
      console.error(msg)
      console.trace(Error('Message received during rendering. Are you updating from a hook without using nextFrame()?'))
      return
    }

    let newModel
    try {
      newModel = update(msg, model)
    } catch (e) {
      console.error(`Error ${e} while handling message`)
      console.error(msg)
      console.trace(e)
      return
    }
    renderView(newModel)
  }
  renderView(init())
}

export {
  Msg,
  Task,
  scope,
  isMsg,
  inMsgs,
  render,
  delegate,
}
