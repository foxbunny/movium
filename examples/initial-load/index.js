import { div, li, match, Msg, nextFrame, onInsert, onUpdate, p, render, Task, ul, when } from 'movium'

let init = () => ({
  loading: true,
  error: null,
  data: [],
})

let Load = Msg.of()

let getData = () => fetch('/data.json')
  .then(res => {
    if (!res.ok) throw Error('Could not fetch data')
    return res.json()
  })
  .then(content => ({ data: content.data, error: null }))
  .catch(error => ({ data: [], error }))

let update = (msg, model) => match(msg,
  when(Load, () => model.loading
    ? Task.from(
      { ...model, loading: true, data: [] },
      getData().then(({ data, error }) => ({ ...model, loading: false, data, error })),
    )
    : model,
  ),
)

let view = model => (
  // We use `nextFrame()` so that the render process can finish before we
  // start the next update. Otherwise, we end up with an exception.
  div([onUpdate(nextFrame(Load))],
    model.error
      ? p([], 'Error: ', model.error.message)
      : null,
    model.loading
      ? p([], 'Loading...')
      : ul([], model.data.map(d => li([], d.name))),
  )
)

let root = document.createElement('div')
document.body.appendChild(root)
render(root, init, update, view)
