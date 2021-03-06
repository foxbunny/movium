# Pattern matching

Pattern matching is a flow control mechanism used in, and provided by, Movium.
The type of pattern matching used in Movium is similar to a switch statement
that switches on the type of the specified value. However, type here is used
very loosely, as types in Movium have a much broader meaning (see
[types](./types.md)). On the other hand, pattern matching in Movium is not as
comprehensive as in some functional programming languages. We find that this
design strikes a good balance between versatility and performance (but pull
requests are welcome!).

## Contents

<!-- vim-markdown-toc GFM -->

* [Basic example](#basic-example)
* [Values in the when() callback](#values-in-the-when-callback)
* [Non-matching values](#non-matching-values)
* [Pattern matching precedence](#pattern-matching-precedence)
* [Patterns are matched using `is()`](#patterns-are-matched-using-is)
* [Writing custom matchers](#writing-custom-matchers)
* [Using pattern matching and types to organize the application](#using-pattern-matching-and-types-to-organize-the-application)
* [Raw match](#raw-match)
* [Curried version](#curried-version)
* [See also](#see-also)

<!-- vim-markdown-toc -->

## Basic example

Let's see a quick example:

```javascript
import { match, when, Any, id } from 'movium'

let ensureArray = x => match(x,
  when(Array, id),
  when(Any, () => [x]),
)
```

The function `ensureArray()` will take a value, and wrap it in an array unless
it is already an array.

To perform the pattern matching, we use two functions, `match()` and `when()`.
The `match()` orchestrates the matching process. It takes the value to be
matched against as the value, followed by any number of matcher functions.
Matcher functions are normally created using the `when()` function. `when()`
takes a type as its first argument, and a function as its second argument. When
the type matches the type of the value, the function is called with the value,
and the return value of the matched function is going to be the return value of
the `match()` call as a whole.

The special type `Any` is used to match anything. There are other special types
discussed in the [types](./types.md) document.

**NOTE:** You may have noticed a peculiar way in which the code is formatted,
notably that there is a line break after the `x,`. This is a stylistic choice
on the part of the Movium's author, and has no effect on the code.

## Values in the when() callback

The second argument to the `when()` function will receive a value if it matches
the specified type. The value received by the function is usually identical to
the value received by `match()` with one exception. When `match()` receives a
value object (see [types](./types.md)), then the value received by the callback
is the value contained *inside* the value object, and not the value object
itself.

```javascript
import { Type, match, when, id } from 'movium'

let Foo = Type.of()
let x = Foo.val('test')

match(x, when(Foo, id)) // => 'test'
```

## Non-matching values

Depending on how the patterns are specified, the matching may fail. For example:

```javascript
import { match, when, id } from 'movium'

let ensureArray = x => match(x,
  when(Array, id),
  when(String, () => [x]),
)
```

In the example, we are only matching arrays and strings. Anything else will
cause an exception to be thrown. Whether you wish to capture all other values
and handle them somehow is up to you. As we've seen in the previous example, it
is possible to use the special type `Any` for that purpose. 

A shortcut for matching `Any` is the `whenElse()` function. To rewrite the 
example we started with:

```javascript
import { match, when, whenElse, id } from 'movium'

let ensureArray = x => match(x,
  when(Array, id),
  whenElse(() => [x]),
)
```

In some cases, we want to let the non-matching value through without doing 
anything to id. We would write `whenElse(id)` to achieve this, but since 
this pattern is common, we have a `through` function to do the same:

```javascript
import { match, when, through } from 'movium'

let errorMessage = x => match(x,
  when(Error, e => error.message),
  through,
)
```

In this example, any value that is not an `Error` object will be returned as is.

## Pattern matching precedence

Patterns are always matched from top to bottom in the order in which they are
specified. Because of this, we have the following recommendations when writing
pattern matching code:

- Common patterns should appear near the top for performance-sensitive code
- Patterns that are more concrete should appear above patterns that are more
  general

Let's see an example of the second recommendation:

```javascript
import { match, when, Any, IterableObject } from 'movium'

let ensureArray = x => match(x,
  when(Array, id),
  when(IterableObject, x => Array.from(x)),
  when(Any, () => [x]),
)
```

In this example, both `Array` and `IterableObject` types will match arrays, but
because `Array` is mentioned first, `IterableObject` will never match arrays in
this example. Therefore, we can treat the second case as 'any iterable object
except arrays'.

Let's now see what happens if we don't follow the second recommendation:

```javascript
import { match, when, Any, IterableObject } from 'movium'

let ensureArray = x => match(x,
  when(IterableObject, x => Array.from(x)),
  when(Array, id),
  when(Any, () => [x]),
)
```

This the last example, the second case never matches because arrays are always
captured by the first pattern.

## Patterns are matched using `is()`

When using the `when()` function to create matchers, we need to keep in mind
that the type passed to `when()` is matched against the value using `is()` (see
[types](./types.md)). This means that a 'type' can be taken very loosely and
defined per our application's needs. For example:

```javascript
import { is, match, when } from 'movium'

let Sequence = Type.of()
let FinishedSequence = Type.of()
is.define(FinishedSequence, x => is(Sequence, x) && x.done)

let s = Sequence.of({ done: false, title: 'My sequence' })

let renderFinished = () => 'This sequence is finished'
let renderSequence = s => `Sequence: ${s.title}`

let renderSequence = s => match(s,
  when(FinishedSequence, renderFinished),
  when(Sequence, renderSequence),
)
```

## Writing custom matchers

In addition to extending the `is()` function, we can also write custom
matchers.  Custom matchers are functions that take the value and return either
a `Match` or a `Miss` value objects whose value will be used as the return
value of a `match()` call.

Let's rewrite the last example using a custom matcher instead of a custom type:

```javascript
import { match, when, Match, Miss } from 'movium'

let Sequence = Type.of()
let s = Sequence.of({ done: false, title: 'My sequence' })

let renderFinished = () => 'This sequence is finished'
let renderSequence = s => `Sequence: ${s.title}`

let renderSequence = s => match(s,
  x => x.done ? Match.val(renderFinished()) : Miss.val(),
  when(Sequence, renderSequence),
)
```

This is not 100% the same as the previous example as we do not explicitly check
whether `x` is a `Sequence` in our custom matcher, but it nevertheless shows
the essence of custom matchers.

The only question now is when to use a custom matcher versus a type. In terms
of performance, there are no inherent disadvantages to either approach. Custom
types are internally looked up using a map, so adding a bazillion custom types
should not have a significant impact on performance. Custom types may have a
slight edge when it comes to readability, though, as custom matcher will
clearly break the pattern of having a sequence of `when()`'s (pun intended).

## Using pattern matching and types to organize the application

The main allure of pattern matching, combined with custom types, is the ability
to provide meta-information about the data without adding extra properties to
objects.

Let's say we have a screen in our app that shows different things depending on
the state of an XHR request. The states could be 'blank' (nothing has been
fetched yet), 'loading' (XHR request is executing), 'finished' (data was
successfully fetched), and 'failed' (data could not be fetched).

We could define our application state as a single object that encodes all this
information:

```javascript
let init = () => ({
  loading: false,
  error: null,
  data: null,
})

let isBlank = model => !model.loading && model.error == null && model.data == null
let isLoading = model => model.loading
let isFinished = model => !model.loading && model.data != null

// The updater will update the model with specific properties
// - start loading --> { ...model, loading: true, error: null, data: null }
// - finish with error --> { ...model, error, data: null }
// - finish successfully --> { ...model, data, error: null }
// - reset -> { loading: false, error: null, data: null }

let renderBlank = () => { /* ... */ }
let renderLoading = () => { /* ... */ }
let renderFailed = () => { /* ... */ }
let renderFinished = () => { /* ... */ }

let view = model => 
  isBlank(model) ? renderBlank(model)
    : isLoading(model) ? renderLoading(model)
      : isFinished(model) ? renderFinished(model)
        : renderFailed(model)
```

You can see how in this very simple example, we can introduce invalid state
(e.g., what happens if we have both `data` and `error`). There's also the
brain-twisting question of what order we should test the state in to be sure
that we've covered all the possible cases.

Alternatively, we could introduce a property called `status` or similar, which
could have a value chosen from a finite set of options (e.g., 'blank',
'loading', etc.).

```javascript
let init = () => ({
  status: 'blank',
  error: null,
  data: null,
})

// The updater will update the model with specific properties
// - start loading --> { ...model, status: 'loading', error: null, data: null }
// - finish with error --> { ...model, status: 'failed', error, data: null }
// - finish successfully --> { ...model, status: 'finished', data, error: null }
// - reset -> { status: 'blank', error: null, data: null }

let renderBlank = () => { /* ... */ }
let renderLoading = () => { /* ... */ }
let renderFailed = () => { /* ... */ }
let renderFinished = () => { /* ... */ }

let renderers = {
  blank: renderBlank,
  loading: renderLoading,
  failed: renderFailed,
  finished: renderFinished,
}

let view = model => renderers[model.status](model)
```

This is certainly much cleaner, but we are still left managing the values of
both `data` and `error` in our model, in places where we shouldn't really be
concerned by them.

Let's try to capture the essence of the second solution using types.

```javascript
import { Type, match, when } from 'movium'

let Blank = Type.of()
let Loading = Type.of()
let Finished = Type.of()
let Failed = Type.of()

let init = () => Blank.of()

// The updater will create a model of specific type depending on the outcome
// - start loading --> Loading.of()
// - finish with error --> Failed.val(error)
// - finish successfully --> Finished.val(data)
// - reset -> Blank.of()

let renderBlank = () => { /* ... */ }
let renderLoading = () => { /* ... */ }
let renderFailed = () => { /* ... */ }
let renderFinished = () => { /* ... */ }

let view = model => match(model,
  when(Blank, renderBlank),
  when(Loading, renderLoading),
  when(Finished, renderFinished),
  when(Failed, renderFailed),
)
```

With the last approach, we are no longer juggling properties that are not
relevant for each of the states, and we have a structure very similar to the
`renderes` object in the second solution achieved using pattern matching.

## Raw match

As mentioned before, matching using `when()` unpacks any value objects passed
to the `match()` before invoking the callback. This is sometimes not the
desired result. Movium provides a `whenRaw()` function which does not unpack
the value object as an alternative. Here's an example:

```
import { Type, match, when, whenRaw, id } from 'movium'

let Unpack = Type.of()
let LeaveAlone = Type.of()

match(LeaveAlone.val('test'),
  when(Unpack, id),
  whenRaw(LeaveAlone, id),
)
// => LeaveAlone.val('test')
```

This can be useful when we are working with values that need to be passed down
to code that does pattern matching itself and we want to keep the type of the
value (e.g., when working with update functions that delegate to some other
module).

## Curried version

Sometimes we want to omit the first argument from `match()` and only specify 
the matchers. The `match()` function cannot be partially applied as the 
first argument is the primary argument. This was a conscious design decision 
to improve readability in the most common case where `match()` is called 
with all of its arguments.

Movium provides a curried version of `match()` called `match$()` which takes 
the first argument separately and after the matchers. Let's rewrite one of 
the examples we've seen before to use `match$()` instead of `match()`:

```javascript
import { match$, when, Type } from 'movium'

let Blank = Type.of()
let Loading = Type.of()
let Finished = Type.of()
let Failed = Type.of()

let init = () => Blank.of()

let renderBlank = () => { /* ... */ }
let renderLoading = () => { /* ... */ }
let renderFailed = () => { /* ... */ }
let renderFinished = () => { /* ... */ }

let view = match$(
  when(Blank, renderBlank),
  when(Loading, renderLoading),
  when(Finished, renderFinished),
  when(Failed, renderFailed),
)
```

Let's compare the `view()` function to the original:

```javascript
let view = model => match(model,
  when(Blank, renderBlank),
  when(Loading, renderLoading),
  when(Finished, renderFinished),
  when(Failed, renderFailed),
)
```

We see that there is no longer any mention of the `model` argument in the 
new version. This is a so-called point-free style, where the 'point' is the 
main (primary) argument, the subject, of the function call.

## See also

- [Framework functions](./framework-functions.md)
- [HTML](./html.md)
- [HTTP](./http.md)
- [Snabbdom modules](./snabbdom-modules.md)
- [Types](./types.md)
- [Tools](./tools.md)
