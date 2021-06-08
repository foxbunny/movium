import { div, input, match, Msg, onInput, p, patch, render, Task, value, Void, when } from 'movium'

/**
 * Sandbox for testing the rendering function, not really a useful example
 */

// MODEL

class ValidationError extends Error {}

let init = () => ({
  text: '',
  error: null,
})

let validate = text => Promise.resolve(text === 'test' ? new ValidationError('Wrong answer') : null)

// UPDATE

let ValidateAndSet = Msg.of({ label: 'A' })
let Set = Msg.of({ label: 'B' })

let update = (msg, model) => console.log('UPDATE') || match(msg,
  when(ValidateAndSet, x => console.log('VALIDATE') || Task.from(
    patch(['text', x], model),
    validate(x),
    Set,
  )),
  when(Set, x => console.log('SET') || match(x,
    when(ValidationError, err => patch(['error', err.message], model)),
    when(Void, () => patch(['error', null], model)),
  )),
)

// VIEW

let view = model => console.log('RENDER') || (
  div([],
    model.error ? p([], model.error) : null,
    p([], input([value(model.text), onInput(ValidateAndSet)])),
  )
)

// EXPORTS

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
