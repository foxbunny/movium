import { eventListenersModule, init as initPatch, propsModule, styleModule } from 'snabbdom'
import { classModule } from '../snabbdomModules/classes'
import {
  documentEventListeners,
  outsideEventListeners,
  windowEventListeners,
} from '../snabbdomModules/specialEventListeners'

const DEFAULT_MODULES = [
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  outsideEventListeners,
  documentEventListeners,
  windowEventListeners,
]

let renderToDOM = (vnode, parentNode, modules = DEFAULT_MODULES) => {
  let patch = initPatch(modules)

  parentNode ??= document.createElement('div')
  let rootNode = document.createElement('div')
  parentNode.appendChild(rootNode)
  patch(rootNode, vnode)
  return { elm: vnode.elm, vnode, patch }
}

export {
  DEFAULT_MODULES,
  renderToDOM
}
