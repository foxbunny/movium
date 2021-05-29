import { eventListenersModule, init as initPatch, propsModule, styleModule } from 'snabbdom'
import { match, when } from './patternMatching'
import { classModule } from './snabbdomModules/classes'
import { documentEventListeners, outsideEventListeners } from './snabbdomModules/specialEventListeners'
import { valueOf } from './tools'
import { Any, is, Type, val } from './types'

let Msg = Type.of()
let Task = Type.of({
  from (model, work, msg) {
    return Task.of({ model, work, msg })
  },
})
let DoNothing = Type.of()

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
    ...snabbdomModules,
  ])

  let oldVnode = rootNode
  let model = init()
  let rendering = false
  let renderView = () => {
    // Render the view on next frame to avoid recursion due to synchronous
    // execution.
    requestAnimationFrame(() => {
      rendering = true
      model = match(model,
        when(Task, t => {
          t.work
            .then(
              x => updater(val(t.msg, x)),
              e => updater(val(t.msg, e)),
            )
          return t.model
        }),
        when(Any, () => model),
      )

      try {
        let newVnode = view(model)(updater)
        patch(oldVnode, newVnode)
        oldVnode = newVnode
      } catch (e) {
        console.error(`Error ${e} while rendering`)
        console.trace(e)
      }

      rendering = false
    })
  }
  let updater = msg => {
    if (rendering) {
      console.error(msg)
      console.trace(Error('Message received during rendering. Are you updating from a hook without using nextFrame()?'))
      return
    }

    try {
      model = update(msg, model)
    } catch (e) {
      console.error(`Error ${e} while handling message`)
      console.error(msg)
      console.trace(e)
      return
    }
    if (is(DoNothing, model)) return
    renderView()
  }
  renderView()
}

export {
  Msg,
  Task,
  DoNothing,
  scope,
  isMsg,
  inMsgs,
  render,
}
