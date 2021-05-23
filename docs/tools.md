# Tools

Movium provides several functions that are aptly classified as 'tools', for the
lack of a better word. This is a collection of lower-level utility functions
that are used internally throughout the framework, but are also exposed so that
you can take advantage of them when constructing your application.

## id(x)

Identity function takes any value and returns the same value as is.

```javascript
import { id } from 'movium'

id(12) // => 12
```

This is useful, among other cases, in pattern matching when one of the branches
is a pass-through. For example:

```javascript
let y = match(x,
  when(Object, () => ({ ...x, done: true })),
  when(Any, id),
)
```

The above code will set the property `done` to `true` if `x` is an object, and
otherwise return the value of `x` as is.

## has(k, x)

This is a shortcut for `Object.prototype.hasOwnProperty`. It takes the key name
as the first argument, and the object as the second so that it can be partially
applied with the key.

```javascript
import { has } from 'movium'

let x = { foo: 'bar' }
let y = Object.create(x)
y.bar = 'baz'

has('bar', y) // => true
has('foo', y) // => false
```

## valueOf(x)

This function returns the value of an object. For anything other than value
objects (discussed later), this function behaves just like `id()`. For value
objects, it returns the value inside it.

```javascript
import { Type, valueOf } from 'movium'

let Foo = Type.of()
let x = Foo.val(2)
let y = 2

valueOf(x) // => 2
valueOf(y) // => 2
```

## partial(f, ...args)

Partially applies a function with specified arguments. This is useful when we
have a variadic function (one that takes multiple arguments), and need a unary
function (one that takes a single argument) in a pipeline or as a callback.

```javascript
import { partial } from 'movium'

let add = (x, y) => x + y
let a = [1, 2, 3]

a.map(partial(add, 2)) // => [3, 4, 5]
```

## tap(f, x)

This function will call the specified function passing it the second argument,
and then return the second argument as is. This is useful for situations when we
want the behavior of `id()` but with a side effect (e.g., adding the value to
local storage).

```javascript
import { tap } from 'movium'

tap(x => localStorage.secret = x, 'some secret') // => 'some secret'
localStorage.secret // => 'some secret'
```

## log(x)

This is a function that outputs the value to the console using `console.log()`
and returns the same value as is. It is the same as doing
`tap(x => console.log(x), x)`. It is useful for debugging purposes.

## copy(x)

Creates a shallow copy of a value. This function recognizes typed objects and
value objects (more on that in [./types.md]) and will wrap them correctly. It
does not recognize custom classes as this library is not meant to be used with
them.

```javascript
import { copy } from 'movium'

let x = { foo: 'bar' }
let y = copy(x)

x === y // => false
y.foo // => 'bar'
```

This function supports the following types out of the box:

- all primitive values (although they are not copied)
- typed object and value objects (see [types](./types.md))
- plain objects
- arrays
- sets
- maps
- dates

For any unsupported type (including custom classes), this function returns the
value as is.

The behavior of this function can be extended or modified. This is achieved by
using the `copy.define()` function.

```javascript
import { copy } from 'movium'

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

copy.define(Point, point => new Point(point.x, point.y))

let x = new Point(10, 20)
let y = copy(x)

x === y // => false
y.x // => 20
```

Extensions can be removed by calling `copy.remove()`. Continuing with the
previous example:

```javascript
copy.remove(Point)

let z = copy(x)
x === y  // => true
```

Please keep in mind that `assignPath()` uses `copy()` under the hood, so
extensions to `copy()` affect its behavior.

## merge(x, y)

This function merges two values. This is not limited to objects, and also works
on some primitive types like numbers and strings. It also handles typed and
value objects (see [types](./types.md)) seamlessly.

```javascript
import { merge } from 'movium'

merge({ foo: 1 }, { bar: 2}) // => { foo: 1, bar: 2 }
merge([1, 2, 3], [4, 5, 6]) // => [1, 2, 3, 4, 5, 6]
merge('foo', 'bar') // => 'foobar'
merge(1, 4) // => 5
```

Unlike `copy()`, this function cannot be extended or modified.

## assignPath(path, x)

This function creates a copy of the value and performs an operation at the
specified path. The `path` argument is an array of keys and indices that ends in
a value or an operation.

**NOTE:** In most JavaScript libraries, this type of function will take three
arguments: the path, the value, and an object on which assignment is
performed. `assignPath`, on the other hand, takes only two arguments, because
the value is part of the path. This design has one advantage over the more
conventional one, which is that the path, and the value can be passed around as
a single value. This is taken advantage of in many places within Movium, but
most notably in HTML properties (see
[html](./html.md)).

This function works on anything that has properties, including objects, 
arrays, objects using custom classes and prototypes, DOM nodes, etc. Note, 
however, that only values supported by `copy()` are copied.

```javascript
import { assignPath } from 'movium'

let x = { foo: { bar: [1, 2, 3] } }
let y = assignPath(['foo', 'bar', 2, 6], x)

x === y // => false
y // => { foo: { bar: [1, 2, 6] } }
```

This creates not only a copy of the object that is passed to `assignPath()`, 
but any of the objects that are along the specified path. In the above example,
we are creating a copy of the `x` object, and also `x.foo`, and the array 
`x.foo.bar`.

Typed and value objects are copied as well. For example:

```javascript
import { assignPath, Type, is } from 'movium'

let Foo = Type.of()
let Bar = Type.of()

let x = Foo.of({ 
  foo: { 
    bar: Bar.val({ 
      baz: [1, 2, 3] 
    }) 
  } 
})
let y = assignPath(['foo', 'bar', 'baz', 2, 6], x)

is(Foo, y) // => true
is(Bar, y.foo.bar) // => true
y.foo.bar.value // => { baz: [1, 2, 6] }
```

In example thus far, we have seen how to assign values. `assignPath()`, 
despite its name, is not limited to assigning values, though. By wrapping 
the last item in the `path` argument, we can modify the default behavior. 
There are several wrappers that serve this purpose. 

The `Append` wrapper causes `assignPath()` to append the value at the 
specified path. If there is no value, it will simply assign, but if there is 
already a value, it will append to it.

```javascript
import { assignPath, Append } from 'movium'

let handlers = {}
handlers = assignPath(['click', Append.val('save')], handlers)
// => { click: 'save' }
handlers = assignPath(['click', Append.val('close')], handlers)
// => { click: ['save', 'close'] }
handlers = assignPath(['click', Append.val('logOut')], handlers)
// => { click: ['save', 'close', 'logOut'] }
```

The `Call` wrapper wraps a function which is called with the current value 
at the path, and its return value is then assigned to the same location.

```javascript
import { assignPath, Call } from 'movium'

let nums = { x: 1, y: 1, z: 2 }
let inc = x => x + 1
nums = assignPath(['x', Call.val(inc)])
// => { x: 2, y: 1, z: 2 }
```

The `Merge` wrapper will merge the existing value with the new value. If 
there is no existing value, the new value is simply assigned. See the 
documentation for the `merge()` function for more information on how the 
merge is intended to work.

```javascript
import { assignPath, Merge } from 'movium'

let props = { style: { border: 0 }}
props = assignPath([
  'style', 
  Merge.val({ height: '12px', display: 'inline-block' })
], props)
// => { style: { border: 0, height: '12px', display: 'inline-block' } } 
```

## See also

- [Types](./types.md)
- [Pattern Matching](./pattern-matching.md)
