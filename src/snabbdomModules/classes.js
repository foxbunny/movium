import { has } from '../tools'

let delay = f => (...args) => requestAnimationFrame(() => f(...args))
let needsReflowOnUpdate = false

let setClass = (elm, className, use) => elm.classList[use ? 'add' : 'remove'](className)
let setNextFrame = delay(setClass)

let updateClasses = (oldVnode, newVnode) => {
  let elm = newVnode.elm

  let oldClasses = oldVnode.data.class
  let newClasses = newVnode.data.class

  if (!oldClasses && !newClasses) return
  if (oldClasses === newClasses) return

  oldClasses ??= {}
  newClasses ??= {}

  let oldHasDelayed = has('delayed', oldClasses)

  // First remove classes that are no longer specified
  for (let name in oldClasses) if (!has(name, newClasses)) elm.classList.remove(name)

  // Add new classes
  for (let name in newClasses) {
    let use = newClasses[name]
    if (name === 'delayed' && has('delayed', newClasses)) {
      for (let delayedName in newClasses.delayed) {
        let use = newClasses.delayed[delayedName]
        if (!oldHasDelayed || oldClasses[delayedName] !== use)
          setNextFrame(elm, delayedName, use)
      }
    }
    else if (name !== 'remove' && name !== 'destroy' && oldClasses[name] !== use)
      setClass(elm, name, use)
  }
}

let applyDestroyClasses = vnode => {
  if (!vnode.data.class?.destroy) return
  let destroyClasses = vnode.data.class.destroy
  for (let name in destroyClasses) setClass(vnode.elm, name, destroyClasses[name])
}

let applyRemoveClasses = (vnode, rm) => {
  if (!vnode.data.class?.remove) {
    rm()
    return
  }

  let elm = vnode.elm

  if (needsReflowOnUpdate) {
    // Access a property that would cause a reflow
    elm.offsetLeft
    needsReflowOnUpdate = false
  }

  let removeClasses = vnode.data.class.remove

  let appliedClasses = []

  for (let name in removeClasses) {
    if (removeClasses[name] && !elm.classList.contains(name)) {
      appliedClasses.push(name)
      elm.classList.add(name)
    } else if (!removeClasses[name] && elm.classList.contains(name)) {
      appliedClasses.push(name)
      elm.classList.remove(name)
    }
  }

  let numAppliedClasses = appliedClasses.length

  if (!numAppliedClasses) {
    rm()
    return
  }

  let removeOnAnimEnd = () => {
    numAppliedClasses -= 1
    if (!numAppliedClasses) rm()
  }
  elm.addEventListener('transitionend', removeOnAnimEnd)
  elm.addEventListener('animationend', removeOnAnimEnd)
}

let forceReflow = () => {
  needsReflowOnUpdate = true
}

let module = {
  pre: forceReflow,
  create: updateClasses,
  update: updateClasses,
  destroy: applyDestroyClasses,
  remove: applyRemoveClasses,
}

export {
  module as classModule
}
