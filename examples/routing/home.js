import { a, div, h1, href, li, p, ul } from 'movium'

// MODEL

let init = () => {}

// UPDATE

let update = (msg, model) => model

// VIEW

let view = () => (
  div([],
    h1([], 'Welcome to routing demo'),
    p([], 'Hello from home.'),
    ul([],
      li([], a([href('#about')], 'About')),
      li([], a([href('#about/foo')], 'About Foo')),
      li([], a([href('#about/bar')], 'About Bar')),
    )
  )
)

// EXPORTS

export {
  init,
  update,
  view,
}
