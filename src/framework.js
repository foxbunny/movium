import { init, classModule, propsModule, eventListenersModule } from 'snabbdom'
import { match, when } from './patternMatching'
import { log } from './tools'
import { valueObj, subtype, is, Type, Any } from './types'

let patch = init([
  classModule,
  propsModule,
  eventListenersModule,
])

let Msg = subtype()
let Model = subtype()
let Task = subtype()

// Update :: (Msg, Model) -> (Model | Task)
// Updater :: Msg -> HTMLElement
// View :: Updater -> HTMLElement

// ((Type | (Type -> Type)), View) -> View
let scope = (t, view) => update =>
  view(msg => update(typeof t === 'function' ? t(msg) : valueObj(t, msg)))

// (Type, View) -> * -> View
let scopedItem = (t, view) => item => update =>
  view(item)(msg => update(valueObj(t, { item, msg })))

// (Msg, Msg) -> True
let isMsg = (t, x) => x != null && (is(t, x) || is(t, x.value) || isMsg(t, x.value?.msg))
let inMsgs = (ts, x) => ts.some(t => isMsg(t, x))

// (T, Promise<T>) -> Task
let task = (model, promise) => subtype(Task, { model, promise })

// (T | Task) -> (Model | Task)
let taskOrModel = x => match(x,
  when(Task, task => subtype(Task, {
    model: subtype(Model, task.model),
    promise: task.promise.then(model => subtype(Model, model)),
  })),
  when(Any, model => subtype(Model, model))
)

// (HTMLElement, (-> Model), Update, View) -> Void
let render = (rootNode, init, update, view) => {
  let oldVnode = rootNode
  let model = init()
  let renderView = () => {
    let newVnode = view(model)(updater)
    patch(oldVnode, newVnode)
    oldVnode = newVnode
  }
  let updater = msg => {
    match(log(update(msg, model)),
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
  Model,
  Task,
  scope,
  scopedItem,
  isMsg,
  inMsgs,
  task,
  taskOrModel,
  render,
}
