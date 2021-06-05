import { a, div, h2, href, p } from 'movium'

// MODEL

let init = () => {}

// UPDATE

let update = (msg, model) => model

// VIEW

let view = () => (
  div([],
    h2([], 'Bar'),
    p([], 'Hello from Bar'),
    p([], a([href('#about')], 'Back')),
  )
)

// EXPORTS

export {
  init,
  update,
  view,
}
