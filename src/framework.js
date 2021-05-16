import { classModule, styleModule, eventListenersModule, init as initPatch, propsModule } from 'snabbdom'
import { match, when } from './patternMatching'
import { documentEventListeners, outsideEventListeners } from './specialEventListeners'
import { Any, is, Type, val } from './types'

let Msg = Type.of()
let Task = Type.of({
  from(model, promise) {
    return Task.of({ model, promise })
  }
})

// Update :: (Msg, Model) -> (Model | Task)
// Updater :: Msg -> HTMLElement
// View :: Updater -> HTMLElement

// ((T | (T -> T)), View) -> View
let scope = (proto, view) => update =>
  view(msg => update(typeof proto === 'function' ? proto(msg) : val(proto, msg)))

// (Type, View) -> * -> View
let scopedItem = (proto, view) => item => update =>
  view(item)(msg => update(val(proto, { item, msg })))

// (Msg, Msg) -> True
let isMsg = (proto, x) => x != null && (is(proto, x) || is(proto, x.value) || isMsg(proto, x.value?.msg))
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
  let renderView = () => {
    let newVnode = view(model)(updater)
    patch(oldVnode, newVnode)
    oldVnode = newVnode
  }
  let updater = msg => {
    match(update(msg, model),
      when(Task, t => {
        model = t.model
        renderView()

        t.promise.then(x => {
          model = x
          renderView()
        })
      }),
      when(Any, x => {
        model = x
        renderView()
      })
    )
  }
  renderView()
}

export {
  Msg,
  Task,
  scope,
  scopedItem,
  isMsg,
  inMsgs,
  render,
}
