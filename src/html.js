import { h } from 'snabbdom'
import { Append, assignPath, id, partial } from './tools'
import { val } from './types'

let el = name => (props = null, ...children) => updater => {
  let propsObj = {}
  let childList = []

  if (props) for (let p of props) {
    if (p == null) continue
    if (typeof p === 'function') p = p(updater)
    propsObj = assignPath(p, propsObj)
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

  prop,
  value,
  type,
  contentEditable,
  tabIndex,
  disabled,

  onClick,
  onInput,
  onBlur,
  onKeyup,
  onKeydown,
  onKeypress,
  onKey,
}
