import { h } from 'snabbdom'
import { match, when } from './patternMatching'
import { Append, apply, Call, id, partial, patch, randId, valueOf } from './tools'
import { Any, is, Type, val } from './types'

let el = name => (props = null, ...children) => updater => {
  let propsObj = {}
  let childList = []

  if (props) for (let p of props) {
    if (p == null) continue
    if (typeof p === 'string') p = className(p, true)
    if (typeof p === 'function') p = p(updater)
    if (is(Array, p)) propsObj = patch(p, propsObj)
  }

  for (let c of children.flat(3)) {
    if (typeof c === 'function') c = c(updater)
    childList.push(c)
  }

  return h(name, propsObj, childList)
}

// Elements
let a = el('a')
let abbr = el('abbr')
let address = el('address')
let area = el('area')
let article = el('article')
let aside = el('aside')
let audio = el('audio')
let b = el('b')
let base = el('base')
let bdi = el('bdi')
let bdo = el('bdo')
let blockquote = el('blockquote')
let br = el('br')
let button = el('button')
let canvas = el('canvas')
let caption = el('caption')
let cite = el('cite')
let code = el('code')
let col = el('col')
let colgroup = el('colgroup')
let data = el('data')
let datalist = el('datalist')
let dd = el('dd')
let del = el('del')
let details = el('details')
let dfn = el('dfn')
let dialog = el('dialog')
let div = el('div')
let dl = el('dl')
let dt = el('dt')
let em = el('em')
let embed = el('embed')
let fieldset = el('fieldset')
let figcaption = el('figcaption')
let figure = el('figure')
let font = el('font')
let footer = el('footer')
let form = el('form')
let head = el('head')
let header = el('header')
let hgroup = el('hgroup')
let h1 = el('h1')
let h2 = el('h2')
let h3 = el('h3')
let h4 = el('h4')
let h5 = el('h5')
let h6 = el('h6')
let hr = el('hr')
let i = el('i')
let iframe = el('iframe')
let img = el('img')
let input = el('input')
let ins = el('ins')
let kbd = el('kbd')
let keygen = el('keygen')
let label = el('label')
let legend = el('legend')
let li = el('li')
let link = el('link')
let main = el('main')
let map = el('map')
let mark = el('mark')
let menu = el('menu')
let menuitem = el('menuitem')
let meta = el('meta')
let meter = el('meter')
let nav = el('nav')
let object = el('object')
let ol = el('ol')
let optgroup = el('optgroup')
let option = el('option')
let output = el('output')
let p = el('p')
let param = el('param')
let picture = el('picture')
let pre = el('pre')
let progress = el('progress')
let q = el('q')
let rp = el('rp')
let rt = el('rt')
let ruby = el('ruby')
let s = el('s')
let samp = el('samp')
let script = el('script')
let section = el('section')
let select = el('select')
let small = el('small')
let source = el('source')
let span = el('span')
let strong = el('strong')
let sub = el('sub')
let summary = el('summary')
let sup = el('sup')
let svg = el('svg')
let table = el('table')
let tbody = el('tbody')
let td = el('td')
let template = el('template')
let textarea = el('textarea')
let tfoot = el('tfoot')
let th = el('th')
let thead = el('thead')
let time = el('time')
let tr = el('tr')
let track = el('track')
let u = el('u')
let ul = el('ul')
let variable = el('var')
let video = el('video')
let wbr = el('wbr')

let key = k => ['key', k]

// Class and style timing types
let Remove = Type.of()
let Delayed = Type.of()
let Destroy = Type.of()

// Classes
let className = (classes, use = true) => [
  'class', Call.val(
    (cls = {}) => {
      let prefix = match(classes,
        when(Remove, () => ['remove']),
        when(Delayed, () => ['delayed']),
        when(Destroy, () => ['destroy']),
        when(Any, () => []),
      )
      return valueOf(classes).split(' ').reduce((out, name) => patch(prefix.concat([name, use]), out), cls)
    },
  ),
]

// Styles
let style = styles => ['style', styles]

// Properties
let prop = (name, val) => ['props', name, val]
let value = partial(prop, 'value')
let type = partial(prop, 'type')
let contentEditable = partial(prop, 'contentEditable')
let tabIndex = partial(prop, 'tabIndex')
let disabled = partial(prop, 'disabled')
let placeholder = partial(prop, 'placeholder')
let src = partial(prop, 'src')
let href = partial(prop, 'href')
let name = partial(prop, 'name')
let htmlId = partial(prop, 'id')
let htmlFor = partial(prop, 'for')
let alt = partial(prop, 'alt')
let title = partial(prop, 'title')

// Hooks
let hook = (hookName, f) => update => [
  'hook',
  hookName,
  typeof f === 'function'
    ? (...args) => f(update, ...args)
    : (...args) => update(val(f, args)),
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

let nextFrame = f => (update, ...args) =>
  requestAnimationFrame(() => typeof f === 'function'
    ? f(update, ...args)
    : update(val(f, args)),
  )

// Event listeners

// Event -> String
let codeGetter = ev => ev.code

let eventListener = key => (eventName, valueGetter) => (proto, f = valueGetter) => match(proto,
  when(Function, () => update => [key, eventName, Append.val((ev, vnode) => proto(f(ev), ev, vnode, update))]),
  when(Any, () => update => [key, eventName, Append.val(ev => update(val(proto, f(ev))))]),
)
let whenKeyMatches = (code, f) => (ev, ...args) => {
  if (ev.code !== code) return
  ev.preventDefault()
  f(ev, ...args)
}
let shortcutListener = key => (code, proto, f = codeGetter) => match(proto,
  when(Function, () => update =>
    [key, 'keydown', Append.val(whenKeyMatches(code, (ev, ...args) => proto(f(ev), ev, ...args, update)))]),
  when(Any, () => update =>
    [key, 'keydown', Append.val(whenKeyMatches(code, ev => update(val(proto, f(ev)))))]),
)

let elementListener = eventListener('on')
let onClick = elementListener('click', id)
let onInput = elementListener('input', ev => is(String, ev.target.value) ? ev.target.value : ev.target.innerText)
let onChange = elementListener('input', ev => is(String, ev.target.value) ? ev.target.value : ev)
let onFocus = elementListener('focus', id)
let onBlur = elementListener('blur', id)
let onMouseDown = elementListener('mousedown', id)
let onMouseMove = elementListener('mousemove', id)
let onMouseUp = elementListener('mouseup', id)
let onTouchStart = elementListener('touchstart', id)
let onTouchMove = elementListener('touchmove', id)
let onTouchEnd = elementListener('touchend', id)
let onKeydown = elementListener('keydown', codeGetter)
let onKeyup = elementListener('keyup', codeGetter)
let onKeypress = elementListener('keypress', codeGetter)
let onKey = shortcutListener('on')
let onScroll = elementListener('scroll', id)

// (String, (Event -> *)) -> (Type, (Event -> *)) -> Update -> *[]
let outsideListener = eventListener('onOutside')
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
let onKeyOutside = shortcutListener('onOutside')
let onScrollOutside = outsideListener('scroll', id)

// (String, (Event -> *)) -> (Type, (Event -> *)) -> Update -> *[]
let documentListener = eventListener('onDocument')
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
let onKeyDocument = shortcutListener('onDocument')
let onScrollDocument = documentListener('scroll', id)

let windowListener = eventListener('onWindow')
let onClickWindow = windowListener('click', id)
let onMouseDownWindow = windowListener('mousedown', id)
let onMouseMoveWindow = windowListener('mousemove', id)
let onMouseUpWindow = windowListener('mouseup', id)
let onTouchStartWindow = windowListener('touchstart', id)
let onTouchMoveWindow = windowListener('touchmove', id)
let onTouchEndWindow = windowListener('touchend', id)
let onKeydownWindow = windowListener('keydown', codeGetter)
let onKeyupWindow = windowListener('keyup', codeGetter)
let onKeypressWindow = windowListener('keypress', codeGetter)
let onKeyWindow = partial(shortcutListener, 'onWindow')
let onScrollWindow = windowListener('scroll', id)
let onHashchange = windowListener('hashchange', () => window.location.hash)
let onPopstate = windowListener('popstate', () => window.location)
let onResize = windowListener('resize', id)
let onOrientationChange = windowListener('orientationchange', id)

let createHandler = proto => match(proto,
  when(Function, () => proto),
  when(Any, () => (x, _1, _2, update) => update(val(proto, x))),
)
let debounced = (delay, proto) => apply(
  [createHandler(proto)],
  handler => {
    let cb = (x, ev, vnode, update) => {
      clearTimeout(vnode.elm[`__DEBOUNCE_TIMER_${cb.id}__`])
      vnode.elm[`__DEBOUNCE_TIMER_${cb.id}__`] = setTimeout(
        () => handler(x, ev, vnode, update),
        delay,
      )
    }
    cb.id = randId()
    return cb
  },
)
let prevented = proto => apply(
  [createHandler(proto)],
  handler => (x, ev, vnode, update) => {
    ev.preventDefault()
    return handler(x, ev, vnode, update)
  },
)
let noPropagation = proto => apply(
  [createHandler(proto)],
  handler => (x, ev, vnode, update) => {
    ev.stopPropagation()
    return handler(x, ev, vnode, update)
  },
)

export {
  a,
  abbr,
  address,
  area,
  article,
  aside,
  audio,
  b,
  base,
  bdi,
  bdo,
  blockquote,
  br,
  button,
  canvas,
  caption,
  cite,
  code,
  col,
  colgroup,
  data,
  datalist,
  dd,
  del,
  details,
  dfn,
  dialog,
  div,
  dl,
  dt,
  em,
  embed,
  fieldset,
  figcaption,
  figure,
  font,
  footer,
  form,
  header,
  hgroup,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hr,
  i,
  iframe,
  img,
  input,
  ins,
  kbd,
  keygen,
  label,
  legend,
  li,
  link,
  main,
  map,
  mark,
  menu,
  menuitem,
  meta,
  meter,
  nav,
  object,
  ol,
  optgroup,
  option,
  output,
  p,
  param,
  picture,
  pre,
  progress,
  q,
  rp,
  rt,
  ruby,
  s,
  samp,
  script,
  section,
  select,
  small,
  source,
  span,
  strong,
  sub,
  summary,
  sup,
  svg,
  table,
  tbody,
  td,
  template,
  textarea,
  tfoot,
  th,
  thead,
  time,
  tr,
  track,
  u,
  ul,
  variable,
  video,
  wbr,

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
  nextFrame,

  Remove,
  Delayed,
  Destroy,
  className,
  style,

  prop,
  value,
  type,
  contentEditable,
  tabIndex,
  disabled,
  placeholder,
  src,
  href,
  name,
  htmlId,
  htmlFor,
  alt,
  title,

  elementListener,
  onClick,
  onInput,
  onChange,
  onBlur,
  onFocus,
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

  outsideListener,
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

  documentListener,
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

  windowListener,
  onClickWindow,
  onMouseDownWindow,
  onMouseMoveWindow,
  onMouseUpWindow,
  onTouchStartWindow,
  onTouchMoveWindow,
  onTouchEndWindow,
  onKeydownWindow,
  onKeyupWindow,
  onKeypressWindow,
  onKeyWindow,
  onHashchange,
  onPopstate,
  onScroll,
  onResize,
  onOrientationChange,

  debounced,
  prevented,
  noPropagation,
}
