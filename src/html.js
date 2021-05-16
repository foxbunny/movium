import { h } from 'snabbdom'
import { Append, assignPath, id, partial } from './tools'
import { is, val } from './types'

let el = name => (props = null, ...children) => updater => {
  let propsObj = {}
  let childList = []

  if (props) for (let p of props) {
    if (p == null) continue
    if (typeof p === 'function') p = p(updater)
    if (is(Array, p)) propsObj = assignPath(p, propsObj)
  }

  for (let c of children.flat()) {
    if (typeof c === 'function') c = c(updater)
    childList.push(c)
  }

  return h(name, propsObj, childList)
}

// Elements
let a = el('a')
let aside = el('aside')
let button = el('button')
let div = el('div')
let h1 = el('h1')
let h2 = el('h2')
let h3 = el('h3')
let h4 = el('h4')
let h5 = el('h5')
let h6 = el('h6')
let input = el('input')
let label = el('label')
let li = el('li')
let main = el('main')
let option = el('option')
let p = el('p')
let section = el('section')
let select = el('select')
let span = el('span')
let table = el('table')
let tbody = el('tbody')
let td = el('td')
let textarea = el('textarea')
let th = el('th')
let thead = el('thead')
let ul = el('ul')

let key = k => ['key', k]

// Classes
let className = (c, use = true) => ['class', c, use]

// Properties
let prop = (name, val) => ['props', name, val]
let value = partial(prop, 'value')
let type = partial(prop, 'type')
let contentEditable = partial(prop, 'contentEditable')
let tabIndex = partial(prop, 'tabIndex')
let disabled = partial(prop, 'disabled')

// Styles
let style = styles => ['style', styles]

// Hooks
let hook = (hookName, f) => update => [
  'hook',
  hookName,
  typeof f === 'function'
    ? (...args) => f(update, ...args)
    : (...args) => update(val(f, args))
]
let onPre = partial(hook, 'pre')
let onInit = partial(hook, 'init')
let onCreate = partial(hook, 'create')
let onInsert = partial(hook, 'insert')
let onPrepatch = partial(hook, 'prepatch')
let onUpdate = partial(hook, 'update')
let onPostpatch = partial(hook, 'postpatch')
let onDestroy = partial(hook, 'destroy')
let onRemove = partial(hook, 'remove')
let onPost = partial(hook, 'post')

// Event listeners

// Event -> String
let codeGetter = ev => ev.code

// (String, (Event -> *)) -> (Type, (Event -> *)) -> Update -> *[]
let listener = (eventName, valueGetter) => (proto, f = valueGetter) => update =>
  ['on', eventName, Append.val(ev => update(val(proto, f(ev))))]
let onClick = listener('click', id)
let onInput = listener('input', ev => typeof ev.target.value === 'string' ? ev.target.value : ev.target.innerText)
let onBlur = listener('blur', id)
let onMouseDown = listener('mousedown', id)
let onMouseMove = listener('mousemove', id)
let onMouseUp = listener('mouseup', id)
let onTouchStart = listener('touchstart', id)
let onTouchMove = listener('touchmove', id)
let onTouchEnd = listener('touchend', id)
let onKeydown = listener('keydown', codeGetter)
let onKeyup = listener('keyup', codeGetter)
let onKeypress = listener('keypress', codeGetter)
let onKey = (key, type, f = codeGetter) => update =>
  [
    'on',
    'keydown',
    Append.val(ev => {
      if (ev.code !== key) return
      ev.preventDefault()
      update(val(type, f(ev)))
    }),
  ]

// (String, (Event -> *)) -> (Type, (Event -> *)) -> Update -> *[]
let outsideListener = (eventName, valueGetter) => (proto, f = valueGetter) => update =>
  ['onOutside', eventName, Append.val(ev => update(val(proto, f(ev))))]
let onClickOutside = outsideListener('click', id)
let onMouseDownOutside = outsideListener('mousedown', id)
let onMouseMoveOutside = outsideListener('mousemove', id)
let onMouseUpOutside = outsideListener('mouseup', id)
let onTouchStartOutside = outsideListener('touchstart', id)
let onTouchMoveOutside = outsideListener('touchmove', id)
let onTouchEndOutside = outsideListener('touchend', id)
let onKeydownOutside = outsideListener('keydown', codeGetter)
let onKeyupOutside = outsideListener('keyup', codeGetter)
let onKeypressOutside = outsideListener('keypress', codeGetter)
let onKeyOutside = (key, type, f = codeGetter) => update =>
  [
    'onOutside',
    'keydown',
    Append.val(ev => {
      if (ev.code !== key) return
      ev.preventDefault()
      update(val(type, f(ev)))
    }),
  ]

// (String, (Event -> *)) -> (Type, (Event -> *)) -> Update -> *[]
let documentListener = (eventName, valueGetter) => (proto, f = valueGetter) => update =>
  ['onDocument', eventName, Append.val(ev => update(val(proto, f(ev))))]
let onClickDocument = documentListener('click', id)
let onMouseDownDocument = documentListener('mousedown', id)
let onMouseMoveDocument = documentListener('mousemove', id)
let onMouseUpDocument = documentListener('mouseup', id)
let onTouchStartDocument = documentListener('touchstart', id)
let onTouchMoveDocument = documentListener('touchmove', id)
let onTouchEndDocument = documentListener('touchend', id)
let onKeydownDocument = documentListener('keydown', codeGetter)
let onKeyupDocument = documentListener('keyup', codeGetter)
let onKeypressDocument = documentListener('keypress', codeGetter)
let onKeyDocument = (key, type, f = codeGetter) => update =>
  [
    'onDocument',
    'keydown',
    Append.val(ev => {
      if (ev.code !== key) return
      ev.preventDefault()
      update(val(type, f(ev)))
    }),
  ]

let prevent = event => (event.preventDefault(), event)
let stopPropagation = event => (event.stopPropagation(), event)

export {
  a,
  aside,
  div,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  button,
  span,
  main,
  p,
  ul,
  li,
  table,
  thead,
  tbody,
  td,
  th,
  input,
  textarea,
  section,
  select,
  option,
  label,

  key,

  hook,
  onPre,
  onInit,
  onCreate,
  onInsert,
  onPrepatch,
  onUpdate,
  onPostpatch,
  onRemove,
  onDestroy,
  onPost,

  className,
  style,

  prop,
  value,
  type,
  contentEditable,
  tabIndex,
  disabled,

  onClick,
  onInput,
  onBlur,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onKeyup,
  onKeydown,
  onKeypress,
  onKey,

  onClickOutside,
  onMouseDownOutside,
  onMouseMoveOutside,
  onMouseUpOutside,
  onTouchStartOutside,
  onTouchMoveOutside,
  onTouchEndOutside,
  onKeydownOutside,
  onKeyupOutside,
  onKeypressOutside,
  onKeyOutside,

  onClickDocument,
  onMouseDownDocument,
  onMouseMoveDocument,
  onMouseUpDocument,
  onTouchStartDocument,
  onTouchMoveDocument,
  onTouchEndDocument,
  onKeydownDocument,
  onKeyupDocument,
  onKeypressDocument,
  onKeyDocument,

  prevent,
}
