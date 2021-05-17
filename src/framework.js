import { classModule, eventListenersModule, init as initPatch, propsModule, styleModule } from 'snabbdom'
import { match, when } from './patternMatching'
import { documentEventListeners, outsideEventListeners } from './specialEventListeners'
import { id } from './tools'
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
  let rendering = false
  let renderView = () => {
    rendering = true
    model = match(model,
      when(Task, t => {
        // use RAF to avoid a infinite recursion issue if task happens to be
        // sync (e.g., a value wrapped in a `Promise.resolve()`).
        requestAnimationFrame(() =>
          t.work
            .then(
              x => updater(val(t.msg, x)),
              err => updater(val, t.msg, err)
            )
        )
        return t.model
      }),
      when(Any, () => model),
    )
    let newVnode = view(model)(updater)
    patch(oldVnode, newVnode)
    oldVnode = newVnode

    rendering = false
  }
  let updater = msg => {
    if (rendering)
      throw Error('Message received during rendering. Are you updating from a hook without using nextFrame()?')
    if (is(DoNothing, msg)) return
    model = update(msg, model)
    renderView()
  }
  renderView()
}

export {
  Msg,
  Task,
  DoNothing,
  scope,
  scopedItem,
  isMsg,
  inMsgs,
  render,
}
