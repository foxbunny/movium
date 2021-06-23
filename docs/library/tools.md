# Tools

Movium provides several functions that are classified as 'tools', for the lack
of a better word. This is a collection of lower-level utility functions that are
used internally throughout the framework, but are also exposed so that you can
take advantage of them when constructing your application.

## Contents

<!-- vim-markdown-toc GFM -->

* [id(x)](#idx)
* [has(k, x)](#hask-x)
* [valueOf(x)](#valueofx)
* [partial(f, ...args)](#partialf-args)
* [tap(f, x)](#tapf-x)
* [log(x)](#logx)
* [copy(x)](#copyx)
* [merge(x, y)](#mergex-y)
* [get(path, x)](#getpath-x)
* [patch(path, x)](#patchpath-x)
  * [Assign](#assign)
  * [Append](#append)
  * [Merge](#merge)
  * [Delete](#delete)
  * [Pluck](#pluck)
  * [Call](#call)
  * [Specifying a key/index by value](#specifying-a-keyindex-by-value)
* [using(expressions, f)](#usingexpressions-f)
* [piped(...fns)](#pipedfns)
* [pipe(x, ...fns)](#pipex-fns)
* [See also](#see-also)

<!-- vim-markdown-toc -->

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

Please keep in mind that `patch()` uses `copy()` under the hood, so extensions
to `copy()` affect its behavior.

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

## get(path, x)

This function is used to retrieve a value one or more levels of properties
inside an object and/or array.

For example:

```javascript
import { get } from 'movium'

let x = { foo: { bar: [1, 2, 3] } }
get(['foo', 'bar', 2], x)
// => 3
```

If any members in the specified path are missing, or the specified object is
void, then `undefined` is returned.

## patch(path, x)

This function creates a copy of the value and performs an operation at the
specified path. The `path` argument is an array of keys and indices that ends in
a value or an operation.

**NOTE:** In most JavaScript libraries, this type of function will take three
arguments: the path, the value, and an object on which assignment is
performed. `patch`, on the other hand, takes only two arguments, because the
value is part of the path. This design has one advantage over the more
conventional one, which is that the path, and the value can be passed around as
a single value. This is taken advantage of in many places within Movium, but
most notably in HTML properties (see
[html](./html.md)).

This function works on anything that has properties, including objects, arrays,
objects using custom classes and prototypes, DOM nodes, etc. Note, however, that
only values supported by `copy()` are copied.

```javascript
import { patch } from 'movium'

let x = { foo: { bar: [1, 2, 3] } }
let y = patch(['foo', 'bar', 2, 6], x)

x === y // => false
y // => { foo: { bar: [1, 2, 6] } }
```

This creates not only a copy of the object that is passed to `patch()`, but any
of the objects that are along the specified path. In the above example, we are
creating a copy of the `x` object, and also `x.foo`, and the array
`x.foo.bar`.

There is an exception to the copying behavior of `patch()`. If the value being
assigned at the target path exactly matches the value that is already at the
path, then the original object is returned as is. For example:

```javascript
import { patch } from 'movium'

let x = { foo: { bar: [1, 2, 3] } }
let y = patch(['foo', 'bar', 2, 3], x)

x === y // => true
```

Typed and value objects are copied as well. For example:

```javascript
import { patch, Type, is } from 'movium'

let Foo = Type.of()
let Bar = Type.of()

let x = Foo.of({ 
  foo: { 
    bar: Bar.val({ 
      baz: [1, 2, 3] 
    }) 
  } 
})
let y = patch(['foo', 'bar', 'baz', 2, 6], x)

is(Foo, y) // => true
is(Bar, y.foo.bar) // => true
y.foo.bar.value // => { baz: [1, 2, 6] }
```

Note that array indexes can be used even when no arrays exist within the
specified path. Intermediate arrays will be created, and the values are going to
be assigned at the specified index. For example:

```javascript
import { patch } from 'movium'

let x = { foo: 'bar' }
patch(['baz', 1, { qux: 'me' }], x)
// => { foo: 'bar', baz: [, { qux: 'me' }] }
```

When creating arrays this way, you should keep in mind that arrays will have
blank elements leading up the element being inserted (elements that are not
participating in iteration using array methods like `map()` or `forEach()`).
This is intentional, as blank elements represent elements that do not exist,
which s technically correct.

We can assign values asynchronously by using a `Promise`. For example to make
the last example asynchronous we would do something like this:

```javascript
import { patch } from 'movium'

let x = { foo: 'bar' }
let p = patch(['baz', 1, Promise.resolve({ qux: 'me' })], x)
// => [object Promise]
p.then(console.log)
// => { foo: 'bar', baz: [, { qux: 'me' }] }
```

If we want to assign a promise as is without this asynchronous assignment
behavior, we can use the `Assign` wrapper (see below).

In example thus far, we have seen how to assign values. This function is not
limited to assigning values, though. By wrapping the last item in the `path`
argument, we can modify the default behavior. There are several wrappers that
serve this purpose.

### Assign

The `Assign` wrapper results in the same operation as not wrapping the value at
all. It exists because `Promise` objects have special treatment and can
therefore not be assigned without explicitly wrapping it in `Assign`. For
example:

```javascript
import { patch } from 'movium'

let x = { foo: 'bar' }
let p = patch(['baz', 1, Assign.val(Promise.resolve({ qux: 'me' }))], x)
// => { foo: 'bar', baz: [object Promise] }
```

### Append

The `Append` wrapper causes `patch()` to append the value at the specified path.
If there is no value, it will simply assign, but if there is already a value, it
will append to it.

```javascript
import { patch, Append } from 'movium'

let handlers = {}
handlers = patch(['click', Append.val('save')], handlers)
// => { click: 'save' }
handlers = patch(['click', Append.val('close')], handlers)
// => { click: ['save', 'close'] }
handlers = patch(['click', Append.val('logOut')], handlers)
// => { click: ['save', 'close', 'logOut'] }
```

### Merge

The `Merge` wrapper will merge the existing value with the new value. If there
is no existing value, the new value is simply assigned. See the documentation
for the `merge()` function for more information on how the merge is intended to
work.

```javascript
import { patch, Merge } from 'movium'

let props = { style: { border: 0 }}
props = patch([
  'style', 
  Merge.val({ height: '12px', display: 'inline-block' })
], props)
// => { style: { border: 0, height: '12px', display: 'inline-block' } } 
```

### Delete

`Delete` wraps a key or an index and makes `patch()` remove the specified key. 
For example:

```javascript
import { patch, Delete } from 'movium'

let props = { style: { border: 0, padding: '12px' }}
patch(['style', Delete.val('border')], props)
// => { style: { padding: '12px' } } 
```

`Delete` works on arrays, maps,and objects.

`Delete` can be used without a value to delete the previous key. This is the 
behavior prior to v0.10.0. For example, the above example can be rewritten 
like this:

```javascript
import { patch, Delete } from 'movium'

let props = { style: { border: 0, padding: '12px' }}
patch(['style', 'border', Delete], props)
// => { style: { padding: '12px' } } 
```

While there is technically no difference between the two forms, the second 
form can come in handy when used with `Call` (see below), where we can 
conditionally delete keys.

### Pluck

While `Delete` deletes values by key or index, `Pluck` deletes by value. Because
deleting by value is typically done for sequences, `Pluck` only works on arrays
and sets. For example:

```javascript
import { patch, Pluck } from 'movium'

let x = { foo: [1, 2, 3, 4] }
patch(['foo', Pluck.val(3)], x)
// => { foo: [1, 2, 4] }
```

### Call

The `Call` wrapper wraps a function which is called with the current value at
the path, and its return value is then assigned to the same location.

```javascript
import { patch, Call } from 'movium'

let nums = { x: 1, y: 1, z: 2 }
let inc = x => x + 1
nums = patch(['x', Call.val(inc)])
// => { x: 2, y: 1, z: 2 }
```

To perform the operation on the value asynchronously, we simply return a
`Promise` in the function that `Call` wraps. Whenever the function returns a
`Promise`, `patch()` returns a `Promise` that resolves to the patched object:

```javascript
import { patch, Call } from 'movium'

let nums = { x: 1, y: 1, z: 2 }
let asyncInc = x => Promise.resolve(x + 1)
nums = patch(['x', Call.val(inc)])
// => Promise
nums.then(x => console.log(x))
// => { x: 2, y: 1, z: 2 }
```

The function inside `Call` can return wrapped values as well, albeit only a
limited to the following wrappers:

- `Assign`
- `Delete`
- `Pluck`

When returning a wrapped value, the behavior is exactly the same as if it were
located at the same position within the path as `Call` that returned it. For 
example:

```javascript
import { patch, Call, Pluck } from 'movium'

let x = { foo: [1, 2, 3, 4] }
patch(['foo', Call.val(() => Pluck.val(4)], x)
// => { foo: [1, 2, 3] }
```

As mentioned in the section on the `Delete` wrapper, we can conditionally 
delete an object property or array/map member by using `Call` and 
conditionally returning the `Delete` type:

```javascript
import { patch, Call, Pluck } from 'movium'

let isEven = x => x % 2 === 0
let delEven = x => isEven(x) ? Delete : x
let x = { foo: [1, 2, 3, 4] }
patch(['foo', 2, Call.val(delEven)], x)
// => { foo: [1, 2, 3, 4] }
```

### Specifying a key/index by value

In some cases, it is useful to specify a key or index by its value. For example,
maybe we want to replace an array element by another value. To achieve this, we
use the `KeyOf` type:

```javascript
let { patch, KeyOf } from 'movium'

let x = { foo: [1, 2, 3, 4] }
patch(['foo', KeyOf.val(4), 10], x)
// => { foo: [1, 2, 3, 10] }
```

Normally, when we specify a key/index that does not exist, `patch()` creates it
with an appropriate value depending on the next key/index in the path. When
using `KeyOf`, however, this behavior does not make much sense, so it throws an
exception if the value is not found at the specified part of the path.

```javascript
let { patch, KeyOf } from 'movium'

let x = { foo: [1, 2, 3, 4] }
patch(['foo', KeyOf.val(8), 10], x)
// Error: '8 not found in 1,2,3,4'
```

It is the application's responsibility to make sure the value is present.

The `KeyOf` type has an alias called `IndexOf` that can be used to clarify 
that we are talking about array indices. There is no difference except for 
the name.

## using(expressions, f)

This function simply calls a function `f` with a values in the `expression`
array.

To explain what problem this solves, let's first take a look at the following
example:

```javascript
import { div, button, disabled } from 'movium'

let someExpensiveOperation = () => { /* ... */ }

let view = model => (
  div(['menu'],
    button([disabled(someExpensiveOperation())], 'First option'),
    button([disalbed(someExpensiveOperation())], 'Second option'),
  )
)
```

We do not want to repeatedly call `someExpensiveOperation()`, so we need assign
it to a variable:

```javascript
import { div, button, disabled } from 'movium'

let someExpensiveOperation = model => { /* ... */ }

let view = model => {
  let isDisabled = someExpensiveOperation(model)
  
  return (
    div(['menu'],
      button([disabled(isDisalbed)], 'First option'),
      button([disalbed(isDisabled)], 'Second option'),
    )
  )
}
```

There is nothing wrong with the solution. However, the curly braces and
the `return` statement may be an eye-sore for some. For a slight stylistic
variation, we can rewrite the last example using the `using()` function:

```javascript
import { div, button, disabled, using } from 'movium'

let someExpensiveOperation = model => { /* ... */ }

let view = model => using(
  [someExpensiveOperation(model)],
  isDisabled => (
    div(['menu'],
      button([disabled(isDisalbed)], 'First option'),
      button([disalbed(isDisabled)], 'Second option'),
    )
  )
)
```

An alternative to `using()` is an immediately invoked function expression with
default argument values:

```javascript
import { div, button, disabled, using } from 'movium'

let someExpensiveOperation = model => { /* ... */ }

let view = model => ((isDisabled = someExpensiveOperation(model)) => (
  div(['menu'],
    button([disabled(isDisalbed)], 'First option'),
    button([disalbed(isDisabled)], 'Second option'),
  )
))()
```

If you don't mind the extra parentheses, this is a valid, and very slightly more
efficient, solution for avoiding the `return` statement.

## piped(...fns)

Create a function that will accept any number of arguments and pipe the 
arguments though each function given as arguments. `piped(f, g)` is 
therefore equivalent of `(...args) => g(f(...args))`. 

Because of the way how pipes work, only the first function in the pipe can take
more than one argument, as any subsequent function must accept the return value
of the previous one. Use partial application to convert functions with 
multiple arguments into a single-argument function (you may need to work on 
the argument order).

```javascript
import { piped } from 'movium'

let inc = x => x + 1
let dbl = x => x * 2
let incDbl = pipe(inc, dbl)

incDbl(2)
// => 6
```

**NOTE:** There is also a function called `pipe()` which does something similar.

## pipe(x, ...fns)

Pipe the value `x` through any number of function passed as second and 
subsequent argument such that each function will take the return value of 
the previous one as its argument. `pipe(x, f, g)` is the same as `g(f(x))`.

```javascript
import { pipe } from 'movium'

let inc = x => x + 1
let dbl = x => x * 2

pipe(2, inc, dbl)
// => 6
```

**NOTE:** There is also a function called `piped()` which does something 
similar.

## See also

- [Framework functions](./framework-functions.md)
- [HTML](./html.md)
- [HTTP](./http.md)
- [Snabbdom modules](./snabbdom-modules.md)
- [Types](./types.md)
- [Pattern Matching](./pattern-matching.md)
