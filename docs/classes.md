# Classes

Movium provides a prop function called `className` which uses the Snabbdom's
class module to add classes to DOM nodes.

## Basic usage

To specify a class on an element, we add one or more `className` to the element
via its props:

```javascript
import { div, className } from 'movium'

let redDiv = div([className('red')])
```

## Multiple classes

We can add multiple classes to an element by using a string that contains
multiple space-separated class names.

```javascript
import { div, className } from 'movium'

let bigRedDiv = div([className('big red')])
```

Unlike many other frameworks, Movium supports repeating the same props multiple
times. We can rewrite the above to be like this:

```javascript
import { div, className } from 'movium'

let bigRedDiv = div([className('big'), className('red')])
```

There is usually no need to do this unless we want to toggle classes 
individually, which we'll cover later.

## Shorthand for classes

Since classes are used a lot in our apps, we have a shortcut for them. We 
can pass the string directly without using the `className` function:

```javascript
import { div, className } from 'movium'

let bigRedDiv = div(['big red'])
```

## Toggling classes

Classes can be toggled using the `className`'s second argument. If the second
argument is a truthy value, the class is added to the element, and otherwise
omitted.

```javascript
import { div, className } from 'movium'

let notRedDiv = div([className('red', false)])
```

The second argument applies to all specified classes. In the next example, none 
of the classes are applied:

```javascript
import { div, className } from 'movium'

let notBigNorRedDiv = div([className('big red', false)])
```

When using multiple classes, we can toggle them individually if we use 
multiple `className` calls:

```javascript
import { div, className } from 'movium'

let notBigRedDiv = div([className('big', false), className('red')])
```

## Class transitions

Using `className`, we can add transition effects at various points in the 
element lifecycle.

There are four types of classes that we can add that serve this purpose:

- normal classes that we've seen thus far
- delayed classes
- destroy classes
- remove classes

Delayed classes are added two frames after the element is inserted into the 
DOM. Destroy classes are added immediately when the element is about to be 
removed from the DOM. Remove classes are added to the element at about the 
same time as the destroy classes, but they are expected to trigger an 
animation or a transition, and these effects delay the removal of the 
element from the DOM tree until the animations are finished.

To apply each of these class types, use the matching type from the Movium 
package:

- `Delayed` - delayed class
- `Destroy` - destroy class
- `Remove` - remove class

For example, to add a remove class, we do the same thing as with normal 
classes, but we wrap the string in a `Remove` type:

```javascript
import { div, className, Remove } from 'movium'

let redDiv = div([className('red'), className(Remove.val('blue'))])
```

When specifying multiple classes, we simply specify a string with 
multiple space-separated classes and wrap them in the `Remove` type:

```javascript
import { div, className, Remove } from 'movium'

let redDiv = div([className('red'), className(Remove.val('blue fade'))])
```

Transition classes can also be removed instead of added using the same 
rules outlined above by specifying the second argument to `className`. For 
example:

```javascript
import { div, className, Remove, Delayed } from 'movium'

let redDiv = div([
  className('red'), 
  className(Delayed.val('active')),
  className(Remove.val('active'), false),
])
```

In the last example, the base class 'red' may have opacity of 0, while the 
'active' class would then have an opacity of 1. By delaying the application 
of 'active' class, we trigger a transition for opacity from 0 to 1, and then 
we later remove the 'active' class using a remove class to transition back 
to opacity 0 before removing the node.

The code in the `css-transitions` example application demonstrates the use 
of CSS transitions.
