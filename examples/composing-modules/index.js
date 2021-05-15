import { render } from 'movium'
import * as main from './app'

let root = document.createElement('div')
document.body.appendChild(root)
render(root, () => main.init(123), main.update, main.view)
