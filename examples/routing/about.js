import { a, Any, div, h1, href, li, match, p, Type, ul, when } from 'movium'
import * as bar from './bar'
import * as foo from './foo'

// MODEL

const SECTION_MODULES = { foo, bar }

let TopLevel = Type.of({ label: 'Blank'})

let init = section => match(SECTION_MODULES[section],
  when(undefined, () => TopLevel.of()),
  when(Any, () => section),
)

// UPDATE

let update = (msg, model) => model

// VIEW

let topLevelView = div([],
  ul([],
    li([], a([href('#about/foo')], 'Foo')),
    li([], a([href('#about/bar')], 'Bar')),
  ),
)

let view = model => (
  div([],
    h1([], 'About stuff'),
    match(model,
      when(TopLevel, topLevelView),
      when(Any, () => SECTION_MODULES[model].view())
    ),
    p([], a([href('#')], 'Home'))
  )
)

// EXPORTS

export {
  init,
  update,
  view,
}
