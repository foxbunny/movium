import { Any, div, match, Msg, onHashchange, render, Type, using, when } from 'movium'
import * as about from './about'
import * as home from './home'

// MODEL

const PAGE_MODULES = {
  '': home,
  about,
}

let withPage = (handleMiss, handleMatch) => using(
  window.location.hash.slice(1).split('/'),
  (page, ...params) => match(PAGE_MODULES[page],
    when(undefined, handleMiss),
    when(Any, module => handleMatch(module, ...params)),
  ),
)

let Missing = Type.of()

let init = () => withPage(
  () => Missing.of(),
  (module, ...params) => module.init(...params),
)

// UPDATE

let GoTo = Msg.of()

let update = (msg, model) => match(msg,
  when(GoTo, init),
  when(Any, () => withPage(
    () => model, // ignoring messages from the missing page
    module => module.update(msg, model),
  )),
)

// VIEW

let missingView = () => div([], 'This is a blank page. Oops.')

let view = model => (
  div([onHashchange(GoTo)],
    withPage(missingView, module => module.view(model))
  )
)

// RENDER

let root = document.createElement('root')
document.body.appendChild(root)
render(root, init, update, view)
