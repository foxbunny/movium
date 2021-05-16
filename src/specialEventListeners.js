let createListener = handleEvent => {
  let listener = event => handleEvent(event, listener.vnode)
  return listener
}

let createListenerUpdater = (handleEvent, dataKey, listenerKey) => (oldVnode, newVnode) => {
  let oldHandlers = oldVnode.data[dataKey]
  let oldListener = oldVnode[listenerKey]
  let oldElm = oldVnode.elm
  let newHandlers = newVnode.data[dataKey]
  let newElm = newVnode.elm

  // New handlers are the same as old handlers
  if (oldHandlers === newHandlers) return

  // There are old handlers that we may need to clean up
  if (oldHandlers && oldListener) {
    // There are no new handlers, so remove them all
    if (!newHandlers) for (let name in oldHandlers)
      document.body.removeEventListener(name, oldListener, false)

    // There are some new handlers, so remove only the ones that are not in
    // the new handlers
    else for (let name in oldHandlers) if (!newHandlers.hasOwnProperty(name))
      document.body.removeEventListener(name, oldListener, false)
  }

  // Update event listeners
  if (newHandlers) {
    let listener = newVnode[listenerKey] = oldListener || createListener(handleEvent)
    listener.vnode = newVnode

    // If there were no old handlers, add the listener for all new handlers
    if (!oldHandlers) for (let name in newHandlers)
      document.body.addEventListener(name, listener, false)

    // If there are old handlers, add listener only for new handlers
    else for (let name in newHandlers) if (!oldHandlers[name])
      document.body.addEventListener(name, listener, false)
  }
}

let invokeHandler = (handler, vnode, event) => {
  // If handler is a function (not array), then just call it
  if (typeof handler === 'function') handler.call(vnode, event, vnode)
  // Otherwise, handler is an iterable, so call it
  else for (let f of handler) f.call(vnode, event, vnode)
}

let handleDocumentEvent = (event, vnode) => {
  let name = event.type
  let handlers = vnode.data.onDocument?.[name]

  // No handlers?
  if (handlers == null) return

  invokeHandler(handlers, vnode, event)
}

let handleOutsideEvent = (event, vnode) => {
  let target = event.target
  let name = event.type
  let el = vnode.elm
  let handlers = vnode.data.onOutside?.[name]

  // No handlers?
  if (handlers == null) return

  // No an outside event?
  if (el.contains(target)) return

  invokeHandler(handlers, vnode, event)
}

let updateDocumentListeners = createListenerUpdater(handleDocumentEvent, 'onDocument', 'documentListener')
let updateOutsideListeners = createListenerUpdater(handleOutsideEvent, 'onOutside', 'outsideListener')

let documentEventListeners = {
  create: updateDocumentListeners,
  update: updateDocumentListeners,
  destroy: updateDocumentListeners,
}
let outsideEventListeners = {
  create: updateOutsideListeners,
  update: updateOutsideListeners,
  destroy: updateOutsideListeners,
}

export {
  documentEventListeners,
  outsideEventListeners,
}
