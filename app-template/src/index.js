import './index.css'
import { render } from 'movium'
import * as main from './app'

let root = document.createElement('div')
document.body.appendChild(root)

render(root, main.init, main.update, main.view, [
  // Extra Snabbdom modules
])
