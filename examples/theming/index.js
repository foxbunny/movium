import { button, div, header, match, Msg, onClick, p, render, style, when } from 'movium'
import './index.css'

// MODEL

const THEMES = {
  light: {
    '--text-color': 'var(--dark)',
    '--background-color': 'var(--light)',
  },
  dark: {
    '--text-color': 'var(--light)',
    '--background-color': 'var(--dark)',
  },
}

let init = () => 'light'

// UPDATE

const NEXT_THEME = {
  light: 'dark',
  dark: 'light',
}

let SwitchTheme = Msg.of()

let update = (msg, model) => match(msg,
  when(SwitchTheme, () => NEXT_THEME[model]),
)

// VIEW

let view = model => (
  div(['app', style(THEMES[model])],
    header(['toolbar'],
      button([onClick(SwitchTheme)], 'Switch theme'),
    ),
    p(['text'],
      'Using the ', model, ' theme',
    ),
  )
)

// RENDER

let root = document.createElement('root')
document.body.appendChild(root)
render(root, init, update, view)
