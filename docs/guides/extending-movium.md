# Extending movium

This document summarizes some of the ways in which Momivum can be extended.
Extensibility is one of the strengths of the Movium framework. It is taken
advantage of not just to add functionality that does not already exist, but
also to simplify the application code.

Before customizing aspects of the framework, it is useful to get familiarized
not just with how the framework works, but also with the underlying
[Snabbdom](https://github.com/snabbdom/snabbdom#readme) library.

## Contents

<!-- vim-markdown-toc GFM -->

* [Custom elements](#custom-elements)
* [Custom properties](#custom-properties)
* [Custom snabbdom modules](#custom-snabbdom-modules)

<!-- vim-markdown-toc -->

## Custom elements

Element functions don't return a (virtual) DOM node directly. Instead, they
return a function that takes an updater function and returns a virtual DOM node.
Their type is roughly like this:

```javascript
// (Props, ...Children) -> Updater -> VNode
```

There are two ways in which we can create custom elements. The simpler way is
to simply write a function that wraps existing element functions:

```javascript
import { div, header, main } from 'movium'

let horizontalRule = () => div(['horizontal-rule'])

let view = model => (
  div([],
    header([], h1([], 'Site title')),
    horizontaRule(),
    main([],
      // ...
    )
  )
)
```

Another way to create custom elements is to write the kind of function that
would be returned by element functions like `div()`.

This means that if you write a function that takes an updater and returns a
`Snabbdom` VNode object, it can be used as an element in your application. For
example:

```javascript
import { h } from 'snabbdom'

let circle = (x, y, radius) => updater =>
  h('circle', attrs: { cx: x, cy: y, r: radius, })
```

In this example, we have created a SVG circle element function that behaves
just like regular HTML elements in Movium.

## Custom properties

You may have noticed that the selection of properties shipped with Movium is
quite limited. The main reason for this is that Movium only ships with
properties that are actually used in applications Movium's author has written.

It is quite easy to write custom properties, however.

A property function such as `onClick` or `href` are functions that take some
inputs, and return a function that either:

- take an updater function and return a path used in `patch()`
- directly return a path used in `patch()`

The updater function is called with a message object which then get relayed to
the update function along with the currrent snapshot of the model. The path is
an array of property names that ends with a value (see
[tools](./tools.md#patchpath-x)).

Here's an example of a custom event handler property:

```javascript
import { Append } from 'movium'

let onTransitionEnd = messageProto => updater =>
  ['on', 'transitionend', Append.val(ev => updater(messageProto.val(ev)))]
```

In this example, we use the path that assigns a 'transitionend' event handler
using Snabbdom's [event listener 
module](https://github.com/snabbdom/snabbdom#the-eventlisteners-module). When 
the event listener function is called, it will, in turn, call the updater and 
pass it a message object that contains the `Event` object coming from the
Snabbdom's event listener.

Here's another example of a simple property that sets the element's `innerHTML`
property:

```javascript
let innerHTML = html => ['props', 'innerHTML', html]
```

Because this prop does not need access to the updater function, it returns the
path directly. It uses the Snabbdom's [props 
module](https://github.com/snabbdom/snabbdom#the-props-module) to assign the
`innerHTML` property.

The following Snabbdom modules are used by default:

- [props module](https://github.com/snabbdom/snabbdom#the-props-module)
- [style module](https://github.com/snabbdom/snabbdom#the-style-module)
- [event listeners 
  module](https://github.com/snabbdom/snabbdom#the-eventlisteners-module)

Additionally, several custom modules are also used:

- [class module](./snabbdom-modules.md#class-module)
- [outside event listeners 
  module](./snabbdom-modules.md#outside-event-listeners-module)
- [document event listeners 
  module](./snabbdom-modules.md#document-event-listeners-module)

## Custom snabbdom modules

When integrating 3rd party libraries, we frequently encounter situations where
the libary does not quite fit the declarative nature of your application.

Let's say we have a video player library that provides methods `configure()`,
`start()` and `stop()` methods. This is a typical imperative way of working
with some functionality.

Our application may have `source` and `playing` properties in our model.

Presumably, there is a 'play' button in the application's interface, which
toggles the `playing` flag.

While the imperative way is to specify the start of the next action explicitly,
the declarative way is to specify a change in state. We need to somehow map the
diference. This can be achieved by using lifecycle hooks (see 
[html](../library/html.md#element-lifecycle-hooks)), but it may become quite
cumbersome if there is a lot of integration code.

The best way to handle complicated logic to synchronize imperative libraries
with declarative code is to use custom Snabbdom modules.

Let's see what it might look like with the aforementioned video player.

```javascript
import player from 'shiny-player'

let updateVnode = (oldVnode, newVnode) => {
  let oldVideoOptions = oldVnode.data.video ?? {}
  let newVideoOptions = newVnode.data.video ?? {}

  let sourceChange = oldVideoOptions.source != newVideoOptions.source
  let playStateChange = oldVideoOptions.playing != newVideoOptions.playing

  // Reuse player if any
  let videoPlayer = newVnode.videoPlayer = 
    oldVnode.videoPlayer ?? player.create()

  if (sourceChanged) {
    if (newVideoOptions.src)  { // source changed
      videoPlayer.load(newVideoOptions.src)
    }
    else { // source was removed
      videoPlayer.stop()
    }
  }

  if (playStateChanged) {
    if (newVideoOptions.playing)
      player.start(n)
  }

}

let playerModule = {
  update: updateVnode,
}

export { playerModule }
```
