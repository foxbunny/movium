import {
  a,
  Any,
  className,
  Delayed,
  div,
  h1,
  key,
  main,
  match,
  Msg,
  onClick,
  Remove,
  render,
  Type,
  when,
  whenElse,
} from 'movium'
import './index.css'

// MODEL

let Home = Type.of({ key: 'home' })
let About = Type.of({ key: 'about' })
let Missing = Type.of({ key: 'missing' })

let init = () => Home.of()

// UPDATE

let GoTo = Msg.of()

let update = msg => match(msg,
  when(GoTo, page => match(page,
    when(Home, () => Home.of()),
    when(About, () => About.of()),
    whenElse(() => Missing.of()),
  )),
)

// VIEW

let page = (k, ...content) => div([
  'page',
  className(Delayed.val('fly-in')),
  className(Remove.val('fly-out')),
  key(k),
], content)

let home = model => (
  page(model.key,
    h1([], 'Welcome to Movium'),
    div(['content'],
      'Movium is a JavaScript MVU framework.',
    ),
    div(['link'],
      a([onClick(GoTo, () => About)], 'More about Movium'),
    ),
  )
)

let about = model => (
  page(model.key,
    h1([], 'About Movium'),
    div(['content'],
      'As we already said, it is a JavaScript MVU framework.',
    ),
    div(['link'],
      a([onClick(GoTo, () => 'no such page')], 'Start learning MVU'),
    ),
  )
)

let missing = model => (
  page(model.key,
    h1([], '404: Your dreams end here'),
    div(['content'],
      'This page is intentionally left blank.',
    ),
    div(['link'],
      a([onClick(GoTo, () => Home)], 'Back to home'),
    ),
  )
)

let view = model => (
  main(['main'],
    match(model,
      when(Home, home),
      when(About, about),
      when(Missing, missing),
    )
  )
)

// RENDER

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
