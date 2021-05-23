# Types

Types in Movium are an abstract concept that augment the JavaScript's types. You
can think of types as a superset of JavaScript's types that are defined by the
framework (or your application).

To demonstrate the difference between JavaScript types and types in Movium,
let's list all things that can be considered a type in Movium:

- String, Boolean, Array, and other prototypes provided by JavaScript (what we
  normally call 'types' in JS)
- Special types like `Any`, `IterableObject`, `Void`, which have no one-to-one
  mapping with JavaScript types
- Any custom type created using `Type.of()` or calling `.of()` on any of the
  types created that way

While JavaScript types have the usual semantic familiar to most JavaScript
developers, the meaning of custom types is given by the library or application
code.

For instance, `Any` means nothing to the JavaScript compiler. It's just an
object. However, when we use it with `is()`, it means 'any type'. Similarly,
`Append` doesn't mean anything to the JavaScript compiler, but when used
with `assignPath()` (see [tools](./tools.md)), it means 'value to be appended at
the specified path'.

## Built-in types

Here is a list of built-in types that are provided by Movium:

- `Type` - base prototype of all other Movium types
- `Any` - represents a wildcard type that is of the 'same type' as anything
- `Void` - a type that represents `null` and `undefined`
- `Null` - a type that represents `null` value
- `Undefined` - a type that represents `undefined`
- `Iterable` - a type that represents any iterable value (a value that is
  not `Void` and has a `Symbol.iterator` method)
- `IterableObject` - a subset of `Iterable` that is also an object
- `ValueObject` - any object that has a `Type` prototype and a `value` property
- `Primitive` - any primitive value
- `Complex` - any non-primitive value
- `Msg` - a message sent to the updater
- `Task` - a task returned by the updater
- `DoNothing` - an updater result that signifies that the update to the model
  should not result in a re-render
- `Append` - a value that should be appended to the specified path in
  `assignPath()`
- `Call` - a value that should be used as a function to map over a value at the
  specified path in `assignPath()`
- `Merge` - a value that should be merged into the existing value at the
  specified path in `assignPath()`

## Type, typed objects, and value objects

The `Type` type is the base prototype of all Movium types, and provides methods
for creating our own types and value objects from those types.

**NOTE:** The `Type` and its subtypes are not some kind of voodoo. They are
plain objects that serves as prototypes, and functions like `of()` and `val()`
are trivial wrappers around [`Object.create()`](https://mzl.la/3fb28CM). If 
you have never used prototypal inheritance in JavaScript (and I don't mean 
the `class` syntax or constructor functions, it's worth [learning a bit about 
it](https://mzl.la/3fxXkX2).)

To create a `Type`'s subtype, we use the `of()` method:

```javascript
import { Type } from 'movium'

let Loading = Type.of()
```

Because the `Loading` type has `Type` as its prototype, we are able to call
`of()` on it as well:

```javascript
let status = Loading.of()
```

Technically speaking, there is no difference between the `Loading` and
`status` objects in this example. They are both empty objects. Whether the first
letter is capitalized or not is just our own convention to differentiate between
objects that we *intend* to use as prototypes versus objects that we intend to
use as values. In reality, both can be used in either role.

The `of()` method takes a single argument, which must be an object (of any type)
, and the properties of that object will be copied into the newly created
object. For example, let's say we want to have several types that represent
various pages in our application. We also need to identify those pages in some
way because we want to, say, add a class to the root element.

Object created using `of()` are called 'typed objects'. This naming is there 
mainly so they can be differentiated from 'value objects' discussed later.

```javascript
import { Type, match, when, div } from 'movium'

let Home = Type.of({ label: 'home' })
let About = Type.of({ label: 'about' })
let Gallery = Type.of({ label: 'gallery' })

// Initial page is going to be Home
let init = () => Home.of()

let page = (cls, content) => (
  div(['page', cls], content)
)

let home = model => (
  div([], 'Home'),
)

let about = model => (
  div([], 'About'),
)

let gallery = model => (
  div([], 'Gallery'),
)

let view = model => (
  page(model.label, match(model,
    when(Home, home),
    when(About, about),
    when(Gallery, gallery),
  )
)
```

By adding the `label` property to each of the types we use as the model, we are
able to cleanly separate such metadata from the rendering logic of the
individual pages, and, although not visible in this example, from the updaters
as well.

We mentioned that `of()` only takes objects as its argument. If we want to wrap
a primitive value in a type, we must use the `val()` method instead.

```javascript
import { Type } from 'movium'

let Foo = Type.of()
let x = Foo.val(12)
```

This is a shortcut for saying `Foo.of({ value: 12 })`. Objects that have
`Type` as one of the prototypes, and a `value` property are called value
objects, and they are treated specially in several places inside the framework.
This is documented where appropriate. Objects created this way are called 
'value objects'.

We can convert objects of one type to another simply by passing them into the
desired type's `of()` function. This will copy all *own* properties from the 
given object, and ties to its previous prototype severed.

```javascript
import { Type, is } from 'movium'

let Stopped = Type.of()
let Playing = Type.of()
let Paused = Type.of()

let video = Stopped.of({ title: 'Movium tutorial EP1' })
vide = Playing.of(video)

is(Playing, video) // => true
video.title // => 'Movium tutorial EP1'
```

## is(type, x)

**NOTE:** Before you start reading how `is()` works, it is worth keeping in mind
that this function also powers the [pattern matching](./pattern-matching.md)
functions. Everything that applies to `is()` also applies there.

This function is used to test the value's type. Predictably, the first argument
is the type, and this includes any of the Movium types we mentioned above. The
second argument is the value whose type we are testing. It returns
either `true` (type matches) or `false` (no match).

Unlike similar functions from other JavaScript libraries, `is()` has a few
peculiarities worth mentioning:

- if the value *is* the type(`type === x`), `is()` returns `true`
- is very specific about differentiating between objects in general
  (`Complex` type), and plain objects (`Object` type)
- a match is achieved in any of the following cases:
  - `type` is a prototype of the value
  - `type` is a constructor whose prototype is the value's prototype
  - `type` is the value's constructor (technically this is always the case when
    the previous statement is true, but it is checked explicitly anyway)
- it goes beyond plain JavaScript types to include any of the special types
  provided by Movium or your application
- it can be extended to support any number of types

In the simplest case, `is()` is used like this:

```javascript
import { is, Any } from 'movium'

is(Object, { foo: 'bar' }) // => true
is(Array, [1, 2, 3]) // => true
is(Number, 3) // => true
is(Any, /test/) // => true
```

Any type created using the `Type` prototype is automatically recognized:

```javascript
import { is, Type } from 'movium'

let Foo = Type.of()

is(Foo, Foo.of({ test: 'me' })) // => true
is(Foo, Foo.val('me')) // => true
```

This also works with non-Type prototypes:

```javascript
import { is } from 'movium'

let Foo = {}
let Bar = Object.create(Foo)

is(Bar, Object.create(Bar)) // => true
```

Any member of the prototype chain will match:

```javascript
import { is, Type } from 'movium'

let Foo = Type.of()
let Bar = Foo.of()
let x = Bar.of({ test: 'me' })

is(Bar, x) // => true
is(Foo, x) // => true
is(Type, x) // => true
```

As mentioned, `is()` is extensible. New definitions are added using the
`is.define()` function like this:

```javascript
import { is, Type, match, when, has, Any } from 'movium'

let PositiveNumber = Type.of()
is.define(PositiveNumbe, x => is(Number, x) && x > 0)

let Empty = Type.of()
is.define(Empty, x => match(x, 
  when(Array, () => x.length === 0),
  when(Set, () => x.size === 0),
  when(Map, () => x.size === 0),
  when(Object, () => {
    let i = 0
    for (let k in x) if (has(k, x)) return true
    return false
  }),
  when(Any, () => !x),
))
```
