import { button, div, li, match, onClick, p, render, task, ul, when } from 'movium'

let init = () => ({
  loading: false,
  error: null,
  data: [],
})

let Load = {}
let Clear = {}

let getData = () => fetch('/data.json')
  .then(res => {
    if (!res.ok) throw Error('Could not fetch data')
    return res.json()
  })
  .then(content => ({ data: content.data, error: null }))
  .catch(error => ({ data: [], error }))

let update = (msg, model) => match(msg,
  when(Load, () => task(
    { ...model, loading: true, data: [] },
    getData().then(({ data, error }) => ({ ...model, loading: false, data, error })),
  )),
  when(Clear, () => ({ ...model, loading: false, error: null, data: [] })),
)

let view = model => (
  div([],
    p([],
      button([onClick(Load)], 'Load data'),
      ' ',
      button([onClick(Clear)], 'Clear data'),
    ),
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
