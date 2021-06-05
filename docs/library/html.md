# Creating HTML elements and properties

Because Movium is a web application framework, it naturally ships with functions
for creating HTML interface elements. This document lists the functions used for
this purpose.

## Contents

<!-- vim-markdown-toc GFM -->

* [HTML elements](#html-elements)
  * [Element names](#element-names)
  * [Child elements](#child-elements)
  * [Arrays of child elements](#arrays-of-child-elements)
  * [Conditional rendering](#conditional-rendering)
  * [Custom elements](#custom-elements)
* [Element properties](#element-properties)
  * [Keys](#keys)
  * [Classes](#classes)
    * [Transitions using classes](#transitions-using-classes)
  * [Styles](#styles)
  * [Event listeners](#event-listeners)
    * [Manual event handling](#manual-event-handling)
    * [Outside events](#outside-events)
    * [Document events](#document-events)
    * [Window events](#window-events)
    * [Creating other event listener props](#creating-other-event-listener-props)
  * [Other properties](#other-properties)
  * [Element lifecycle hooks](#element-lifecycle-hooks)
* [See also](#see-also)

<!-- vim-markdown-toc -->

## HTML elements

To create HTML elements, we import functions with a matching name from the
Movium package:

```javascript
import { div } from 'movium'

let myDiv = div([], 'Hello, world')
```

This is all normal JavaScript, and the illusion that we are creating HTML
elements is achieved simply by naming functions after HTML elements.

Each element takes an array of properties as its first argument, and zero or
more children after that. In the last example, we have no properties (empty
array) and a string 'Hello, world' as the only child.

### Element names

In general, you can assume that there is a function for every HTML element
currently supported by the browsers. There are a few exceptions though.

The following elements are omitted because they are never created dynamically in
a real-life application:

- `<html>`
- `<head>`
- `<body>`
- `<title>`

The following elements use a different name because their names clash with
JavaScript keywords:

- `<var>` - `variable()`

### Child elements

Child elements are nested under the element as nested calls:

```javascript
import { div, h1, p, strong } from 'movium'

let myDiv = (
  div([],
    h1([], 'Home page'),
    p([], 'This is the first paragraph.'),
    p([], 
      'This is a second paragraph with ',
      strong('emphasized'),
      ' text',
    ),
  )
)
```

### Arrays of child elements

Although child elements are normally added as additional arguments, they can
also be arrays of elements. Any arrays are flattened before being added.

```javascript
import { div, h1, nav, ul, li, key } from 'movium'

let sections = [
  { title: 'Home', id: 'home' },
  { title: 'About', id: 'about' },
  { title: 'Gallery', id: 'gallery' },
]

let myDiv = (
  div([],
    h1([], 'Sections'),
    nav([],
      ul([],
        sections.map(({ title, id }) => 
          li([key(id)], title))
      ),
    ),
  )
)
```

The `key()` property is added to the `li` element to improve performance when we
have a list that may change during execution. Keys have to be either strings or
numbers, and they must uniquely identify an element. Do not use array indexes
for this purpose, though, as they must identify an element, not its position
within the array.

### Conditional rendering

To conditionally render elements, we use ternaries or similar mechanisms.

```javascript
import { div, h1, p } from 'movium

let isHome = false
let error = null

let myDiv = (
  div([],
    h1([], isHome ? 'Home' : 'Some other page'),
    error && p([], 'OMG, something bad happened!'),
  )
)
```

### Custom elements

Functions like `div()` return a function rather than a virtual node instance.
The returned function is called with an updater function and returns a virtual
node. Because of this, it is possible to create custom elements that take any
arguments you like and return virtual nodes (
see [extending Movium](../guides/extending-movium.md#custom-elements)).

## Element properties

Like elements, properties are also functions (the only example is a class, which
can also be a string). They are specified as an array and passed to the element
function as the first argument.

Here is an example using a few properties.

```javascript
import { Msg, button, disabled, onClick, className } = 'movium'

let Action = Msg.of()

let isActive = false

let myButton = (
  button([disabled(!isActive), className('active', isActive), onClick(Action)], 
    'Click here'
  )
)
```

### Keys

As mentioned briefly before, there is a `key()` property which is used to tag an
element with a unique identifier. The key only needs to be unique among the
siblings, and not globally. When the same view is re-rendered, if the key is
unchanged, the old and new element are treated as the same element and not
recreated. If keys are different, the old element is completely destroyed, which
can be useful for CSS transitions.

### Classes

Classes (as in HTML classes) are specified either as strings, or using the
`className()` function.

Strings are convenient for just adding classes to elements. The `className()`
function, on the other hand, has a few tricks up its sleeve. In either case, a
single string can represent either a single class or multiple space-separated
classes.

Let's take a look at using strings first:

```javascript
import { div } from 'movium'

let myMainDiv = div(['main'])
let myMulticlassDiv = div(['first second'])
```

Here is the same using `className()`:

```javascript
import { div, className } from 'movium'

let myMainDiv = div([className('main')])
let myMulticlassDiv = div([className('first second')])
```

With the `className()` function, we can toggle classes on and off based on the
second argument:

```javascript
import { div, className } from 'movium'

let isActive = false

let myMainDiv = div(['main', className('active', isActive)])
```

In this example, the 'main' class is always added, while the `active` class is
added or removed based on the `isActive` value. In the example, the
'active' class will not be added because `isActive` is `false`.

#### Transitions using classes

Classes can be added with a delay (on the next frame). This can be used to add
transitions to newly created elements. We achieve this by marking the class
using the `Delayed` type:

```javascript
import { div, className, Delayed } from 'movium'

let myMainDiv = div(['base', className(Delayed.val('reveal'))])
```

In this case, the 'base' class is applied immediately after the element is
created. The base class remains applied until the element is destroyed. The
delayed 'reveal' class is applied on the next frame. We may start with
'base' class styling the element in a hidden state (e.g., off-screen or opacity
0), and then the 'reveal' class sets the element into a revealed state.

Classes can also be removed after a delay. If we flip the previous example, we
could start with a class that hides the element, and then remove it after a
delay to trigger a transition:

```javascript
import { div, className, Delayed } from 'movium'

let myMainDiv = div(['base hidden', className(Delayed.val('hidden'), false)])
```

Similar to how we apply and remove classes when the element is created, we can
also apply or remove classes when the element is taken out of the DOM tree. We
achieve this using `Destroy` and/or `Remove` wrappers for our classes. Let's see
an example of a `Remove` class as it is usually more useful:

```javascript
import { div, className, Delayed, Remove } from 'movium'

let myMainDiv = div([
  'base', 
  className(Delayed.val('reveal')),
  className(Remove.val('reveal'), false)
])
```

It's important to note that `Remove` does not tell the framework to remove a
class. Rather, it tells it that the class addition or removal applies to the
remove stage of the element's lifecycle. In our case, we also specified
`false` as a second argument to `className()` so that the 'reveal' class is
removed. If we did not pass that argument, the 'reveal' class would have been
added (that is, not removed), and the animation would not work.

**IMPORTANT:** Classes wrapped in `Remove` *must* trigger a transition or an
animation. If they do not, the element is never removed from the DOM tree.
Movium cannot know if a class will or will not trigger a transition/animation,
and it therefore assumes that all remove classes will trigger one.

### Styles

In some cases, we need to add styles directly to an element instead of via
classes. Typically, we do this when the CSS rules depend on some variables in
the application.

We use the `style` property to add styles to the element:

```javascript
import { div, style } from 'movium'

let pct = 70

let slider = (
  div(['slider'],
    div(['handle', style({ left: pct + '%' })]),
  )
)
```

The styles are specified as a single object that maps property names to their
values. Note, however, that property names must be camelCase, because they must
match the properties on the [`Element.style`](https://mzl.la/3hP8MjY)
property. For example `background-image` would become `backgroundImage`, and so
on.

Similar to class-based transitions, styles can also be delayed, or changed when
the element is about to be removed. This is achieved in the same way as
class-based transitions using `Delayed`, `Destroy` and `Remove` types, so please
refer to the Transition using classes section for more information.

### Event listeners

Event handling is tied directly into how Movium works, so it is one in a way
that is very different from most JavaScript frameworks out there. In the MVU
architecture, view sends messages to the update function, which then updates the
model. User interface events are one of the main sources of messages.

Event listeners are, simply put, message emitters. To illustrate this point,
let's create an element that emits a message on every click:

```javascript
import { button, onClick, Msg } from 'movium'

let Activate = Msg.of()

let myButton = button([onClick(Activate)], 'Activate')
```

The button in the example will emit an `Activate` message when clicked. The
`Activate` type will be used to create a value object (see [types](./types.md)),
which will contain the `Event` object on which the event occurred.

It is possible to customize the value of the value object by passing a second
argument to `onClick()`, The second argument should be a function. The function
will receive the `Event` object, and whatever it returns will be used as the
value of the value object emitted as a message.

This is the full list of event listener properties that can (currently) be used:

- `onClick` - default value: `Event` object
- `onInput` - default value: value of an input or element's inner text since
  input can be triggered on `contenteditable` elements)
- `onChange` - default value: `Event` object
- `onFocus` - default value: `Event` object
- `onBlur` - default value: `Event` object
- `onMouseDown` - default value: `Event` object
- `onMouseMove` - default value: `Event` object
- `onMouseUp` - default value: `Event` object
- `onTouchStart` - default value: `Event` object
- `onTouchMove` - default value: `Event` object
- `onTouchEnd` - default value: `Event` object
- `onKeyup` - default value: [key code](https://mzl.la/2REMHtL)
- `onKeydown` - default value: [key code](https://mzl.la/2REMHtL)
- `onKeypress` - default value: [key code](https://mzl.la/2REMHtL)
- `onKey` - default value: [key code](https://mzl.la/2REMHtL)
- `onScroll` - default value: `Event` object

The `onKey` event listener property is a non-standard event that allows us to
quickly bind keyboard shortcuts. It takes an additional (first) argument which
is the key code. For example:

```javascript
import { textarea, onKey, Msg } from 'movium'

let Cancel = Msg.of()

let myText = textarea([onKey('Escape', Cancel)])
```

**NOTE:** There is currently no support for modifier keys.

In addition to the usual event listeners, Movium supports another several sets
of listeners that handle events that happen outside the target element or at the
document/window level. These listeners are named the same way as the normal
listeners except that they suffixed with 'Outside', 'Document', or 'Window'
(with a few exceptions), and they only support a subset of event listeners that
can be used on the elements. These are discussed later.

#### Manual event handling

We can still handle events manually and do things other than emit messages
(or both). If, instead of a message prototype, we pass a function to the event
listener property, then this function will be called as usual.

Here's an example:

```javascript
import { textarea, onKey, Msg } from 'movium'

let myText = textarea([onKey('Escape', () => alert('You pressed Escape')])
```

The handler function will receive the `Event` object for the event, a Snabbdom
virtual node object for the element on which the event was triggered (if any),
and an updater function that can be called with a message object. We are
therefore still able to emit messages, but it can be done conditionally, or with
a delay, or any number of different ways we choose.

```javascript
// WARNING: quick hack for demo purposes
import { Msg, div, onClick, id } from 'movium'

let Foo = Msg.of()

let debounced = (msg, getter, delay = 200) => (_, vnode, update) => {
  let now = Date.now()
  let lastCall = vnode.elm.lastCall
  if (now - lastCall > delay) update(Foo)
  vnode.elm.lastcall = now
}

div([onClick(debounced(Foo, id))])
```

#### Outside events

The 'outside' event listeners are triggered only when the event target is
outside the element. These are:

- `onClickOutside`
- `onMouseDownOutside`
- `onMouseMoveOutside`
- `onMouseUpOutside`
- `onTouchStartOutside`
- `onTouchMoveOutside`
- `onTouchEndOutside`
- `onKeydownOutside`
- `onKeyupOutside`
- `onKeypressOutside`
- `onKeyOutside`

Here's an example:

```javascript
import { div, onClickOutside, Msg } from 'movium'

let Close = Msg.of()

let myDialog = div(['dialog', onClickOutside(Close)])
```

#### Document events

The 'document' event listeners are triggered when an event bubbles up to the
`document.body` element, regardless of whether the target is inside or outside
the element:

- `onClickDocument`
- `onMouseDownDocument`
- `onMouseMoveDocument`
- `onMouseUpDocument`
- `onTouchStartDocument`
- `onTouchMoveDocument`
- `onTouchEndDocument`
- `onKeydownDocument`
- `onKeyupDocument`
- `onKeypressDocument`
- `onKeyDocument`

Here's an example that adds a global shortcut for the Escape key:

```javascript
import { div, onKeyDocument, Msg } from 'movium'

let Close = Msg.of()

let myDialog = div(['dialog', onKeyDocument('Escape', Close)])
```

#### Window events

'Window' events are triggered on the `window` object. These are:

- `onClickWindow`
- `onMouseDownWindow`
- `onMouseMoveWindow`
- `onMouseUpWindow`
- `onTouchStartWindow`
- `onTouchMoveWindow`
- `onTouchEndWindow`
- `onKeydownWindow`
- `onKeyupWindow`
- `onKeypressWindow`
- `onKeyWindow`
- `onScrollWindow`

There are a few more that do not have the 'Window' suffix because they can only
ever be triggered on the `window` object:

- `onHashchange` - default value: `window.location.hash`
- `onPopstate` - default value: `window.location`
- `onResize` - default value: `Event` object
- `onOrientationChange` - default value: `Event` object

#### Creating other event listener props

Movium provides several functions for creating different types of event
Listeners for events that are not provided out of the box:

- `elementListener` - creates a normal event listener property
- `outsideListener` - creates an outside event listener property
- `documentListener` - creates a document event listener property
- `windowListener` - creates a window event listener property

These functions all create property functions that behave just like the
`onClick()`, `onKeyDocument()` and the rest.

To create a new listener property, we call one of the functions and pass it the
event name as the first argument, and the default value getter as the second.
For example, let's say we want to handle a listener for the drop event that
happens on the element:

```javascript
import { elementListener, Msg, div, id } from 'movium'

let onDrop = elementListener('drop', id)

let Dropped = Msg.of()

div([onDrop(Dropped)])
```

### Other properties

Other properties have their usual semantic. Here's a short list of supported
properties:

- `value`
- `type`
- `contentEditable`
- `tabIndex`
- `disabled`
- `placeholder`
- `src`
- `href`
- `name`
- `htmlId` (the `id` property)
- `htmlFor` (the `for` property)
- `alt`
- `title`

To add other properties, we can either use the `prop(name, value)` function, or
even simply use an array `['props', name, value]`. There is no difference
between these two methods as `prop()` is simply a shortcut for creating the
latter.

### Element lifecycle hooks

Because elements in Movium are virtual DOM nodes (and more specifically,
Snabbdom virtual DOM nodes), it is possible to hook into the nodes' lifecycle
hooks.

Virtual DOM nodes are replaced by a process called patching. In this process, a
copy of the existing virtual node is compared with a new node created in the
view, and the difference between them is calculated. This difference is then
applied to the actual DOM in the browser. This process has several stages, and
we are able to hook into all of them:

- pre - the patch process has started
- init - a new virtual node is added but matching DOM node is not yet created
- create - a new DOM node is created but not yet added to the DOM tree
- insert - a new DOM node is inserted into the DOM tree
- prepatch - a DOM node is about to be patched
- update - a DOM node is being updated
- postpatch - a DOM node has been patched
- destroy - a virtual node is being removed
- remove - a DOM node is being removed
- post - the patch process is finished

To hook into the stages, we use hook properties. All hook properties expect a
callback function as its only argument. This function is called when the
appropriate stage is reached, and it receives the updater function (function
used to emit messages) and possibly a number of other arguments depending on the
stage.

The following is a list of supported hook properties with a list of arguments a
callback can expect:

- `onPre` - `callback(updater)`
- `onInit` - `callback(updater, vnode)`
- `onCreate` - `callback(updater, emptyVnode, vnode)`
- `onInsert` - `callback(updater, vnode)`
- `onPrepatch` - `callback(updater, oldVnode, newVnode)`
- `onUpdate` - `callback(updater, oldVnode, newVnode)`
- `onPostpatch` - `callback(updater, oldVnode, newVnode)`
- `onDestroy` - `callback(updater, vnode)`
- `onRemove` - `callback(updater, vnode, removeCallback)`
- `onPost` - `callback(updater)`

Generally speaking, lifecycle hooks are not used very often. For example,
although the 'init' and 'insert' hooks can be used to send a message that
initializes the application state from server-side data, for example, the same
can be achieved by returning a `Task` from the `init` function (see
[async tasks](./async-tasks.md)). For more complex functionality such as
integration with a 3rd party library, it's almost always better to create custom
modules (see [extending Movium](../guides/extending-movium.md)).

## See also

- [Framework functions](./framework-functions.md)
- [HTTP](./http.md)
- [Snabbdom modules](./snabbdom-modules.md)
- [Types](./types.md)
- [Pattern Matching](./pattern-matching.md)
- [Tools](./tools.md)
