# Custom Snabbdom modules

Movium is based on [Snabbdom](https://github.com/snabbdom/snabbdom). While it
does not directly modify Snabbdom's behavior in any way, it does ship with
several custom modules that add functionality not found in Snabbdom out of the
box. This document is not needed if you simply want to use the features
offered by the modules. For a usage guide see [html](./html.md).

This document is meant as low-level documentation for those of you who would 
like to write custom properties.

## Content

<!-- vim-markdown-toc GFM -->

* [Class module](#class-module)
* [Outside event listeners module](#outside-event-listeners-module)
* [Document event listeners module](#document-event-listeners-module)
* [See also](#see-also)

<!-- vim-markdown-toc -->

## Class module

Snabbdom has its own [class 
module](https://github.com/snabbdom/snabbdom#the-class-module). This module
works great, but it does not have support for CSS transitions. Because of that,
Movum supplies its own class module which adds features found in the Snabbdom's
own [style module](https://github.com/snabbdom/snabbdom#the-style-module).

Note that this class module and Snabbdom's class module cannot be used at the
same time as Movium's class module is meant to be a drop-in replacmeent.

Classes are added using the `class` property the same way as in Snabbdom:

```javascript
import { h } from 'snabbdom'

h('div', { class: { myClass: true, disabledClass: false } })
```

In addition, we can add classes that are applied with a delay (delayed by one
frame), when the node is about to be removed from the DOM tree (a.k.a destroy),
and when a node is being removed from the DOM tree (a.k.a. remove).

```javascript
import { h } from 'snabbdom'

h('div', { class: { 
  alwaysApplied: true,
  delay: {
    appliedAfterOneFrame: true,
  },
  destroy: {
    appliedJustBeforeRemoval: true,
  },
  remove: {
    appliedAfterDestroy: true,
  },
}})
```

In the above example, the element is initially creted with `alwaysApplied`
class. One frame after the rendering is finished, it gets
`appliedAfterOneFrame` class applied to it. This can be used to trigger
post-insert animations and transitions. When the element is about to be removed
from the DOM tree, it is immediately assigned `appliedJustBeforeRemoval`, and
immediately after that, it is assigned the `appliedAfterDestroy` class. The
last class must trigger an animation or a transition, and the removal of the
physical DOM node is delayed until these effects finish playing.

## Outside event listeners module

Outside events are events that happen anywhere in the DOM tree and bubble up to
the `document.body` element except those that happen within the target element.
This type of event is useful for things like dialogs and select lists that need
to close when user clicks outside them.

The outside event listeners are added in the same way as with the regular
Snabbdom's [event listeners
module](https://github.com/snabbdom/snabbdom#the-eventlisteners-module), except
that instead of 'on', we use the 'onOutside' property:

```javascript
import { h } from 'snabbdom'

h('div', { onOutside: { dblclick: () => alert('double-clicked outside') } })
```

## Document event listeners module

The document event listeners module is used for global events that are
triggered anywhere in the DOM tree and bubbles up to the `document.body`.

This type of event handling is useful for things like global keyboard
shortcuts, `mousemove` and `touchmove` events that should not stop firing when
the cursor/finger moves outside of the target element during a drag gesture, 
and similar.

The document event listeners are added in the same way as with the regular
Snabbdom's [event listeners
module](https://github.com/snabbdom/snabbdom#the-eventlisteners-module), except
that instead of 'on', we use the 'onDocument' property:

```javascript
import { h } from 'snabbdom'

h('div', { onDocument: { drop: () => alert('you dropped something') } })
```

## See also

- [Framework functions](./framework-functions.md)
- [HTML](./html.md)
- [HTTP](./http.md)
- [Types](./types.md)
- [Pattern Matching](./pattern-matching.md)
- [Tools](./tools.md)
