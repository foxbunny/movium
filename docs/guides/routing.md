# Routing

Routing is not needed in every app, and not every app does routing the same way,
so Movium does not ship with a prescribed routing solution. However, it does
have all the features needed to implement a simple routing solution very
quickly.

Routing is primarily used when we want to allow users to start the application
at a specific point in the application, without having previously used it to
arrive at that point. For example, starting with a shared URLs from a third
party is a common way to end up at an arbitrary points at which we have not
arrived ourselves through usage.

This chapter describes one of the simplest form of routing using
`location.hash` and the `hashchange` event. The code used in this example is
also available in the `examples` folder, and is mainly on display for
illustrative purposes.

## The main module

In a typical Movium app, it is simplest to treat every 'page' as a completely
separate instance of the app that initializes itself and does not depend on the
state from other pages. If there must be shared state (e.g., API keys), we could
store it in the top-level module's model, but we could also store it in,
say, `localStorage`, and fetch it from there every time we are initializing a
new page. You may find that, in most cases, the latter solution is simpler and
works well enough.

The main (top-level) module is usually the place where we are primarily
concerned with routing. In fact, it may have no other task.

Let's create a module that does this.

First we'll enumerate the imports we'll be using in this example to get that out
of the way:

```javascript
import { 
  Any, 
  div, 
  match, 
  Msg, 
  onHashchange, 
  render, 
  Type, 
  using, 
  when 
} from 'movium'
```

Our application consists of four pages. The following is a mapping between
routes and modules:

- `#`: `home.js`
- `#about`: `about.js`
- `#about/foo`: `foo.js` (nested under `about.js`)
- `#about/bar`: `bar.js` (nested under `about.js`)

The top-level module only deals with top-level routes, and the nested routes
(e.g., `#about/bar`) are dealt with through the respective top-level route.

In order to know what routes are handled by what module, we can simply create a
mapping:

```javascript
import * as about from './about'
import * as home from './home'

const PAGE_MODULES = {
  '': home,
  about,
}
```

The `home` module matches an empty hash (fragment identifier), while the
`about` module matches the `#about` hash.

Now there are many possible ways to implement routing. In our case, mapping is
rather straightforward, so calculating what module maps to what route is not
exactly expensive. Because of this, we will create a function that will let us
invoke functions based on the route:

```javascript
let withPage = (handleMiss, handleMatch) => using(
  window.location.hash.slice(1).split('/'),
  (page, ...params) => match(PAGE_MODULES[page],
    when(undefined, handleMiss),
    when(Any, module => handleMatch(module, ...params)),
  ),
)
```

The route is split by a slash `/` and the first segment is considered the
'page' ID, and the rest of the segments are considered parameters. If the first
segment matches one of the keys in `PAGE_MODULES` we have a 'match'. Otherwise,
it's a 'miss'.

The `withPage()` function takes a missing route handler and matched route
handler. The missing route handler is invoked when we do not have a route that
matches any of the registered modules. The matched route handler is called with
the module from the `PAGE_MODULES` map, and the parameters.

When the application starts (and later, whenever the page changes), we
initialize the state of the application using the matching module's `init()`
function. In other words, the matching page *becomes* the application.

```javascript
let Missing = Type.of()

let init = () => withPage(
  () => Missing.of(),
  (module, ...params) => module.init(...params),
)
```

We are using the `withPage()` function here to determine what module will
initialize the application state. The prototype `Missing` is used to mark
missing route (basically a 404 page).

Notice how the `params` are passed to the module's `init()` function. This can
be used for nested routing, which we will see later.

The update function does two things:

- Handle page changes
- Handle all the messages from the active page's module and relay them to the
  module's `update()` function.

Again we use the `withPage()` function to determine what module needs to handle
the updates.

```javascript
let GoTo = Msg.of()

let update = (msg, model) => match(msg,
  when(GoTo, init),
  when(Any, () => withPage(
    () => model, // ignoring messages from the missing page
    module => module.update(msg, model),
  )),
)
```

The view either renders the error message for missing routes, or delegates to
the active page's `view()`.

```javascript
let missingView = () => div([], 'This is a blank page. Oops.')

let view = model => (
  div([onHashchange(GoTo)],
    withPage(missingView, module => module.view(model))
  )
)
```

The `onHashchange()` event listener is used here, and emits the `GoTo` 
message every time the hash changes. This will cause the `update()` to 
select this branch:

```javascript
when(GoTo, init),
```

This simply means that the module is reinitialized. Since by the time we hit 
this part of the code, the hash has already changed, we will reinitialize 
the module with for a different page.

## Page module

We won't dig too deeply into individual pages (you can see the code in the 
`examples/routing` folder). We'll just take a quick look at the `about` page 
in order to determine how nested routes work.

As before, we creat a mapping of page identifiers to modules, this time for 
the nested routes:

```javascript
import * as bar from './bar'
import * as foo from './foo'

const SECTION_MODULES = { foo, bar }
```

This time we don't need any special function for matching the routes, as 
that's already taken care of by the parent. Let's take a look at the `init()` 
function:

```javascript
let init = section => match(SECTION_MODULES[section],
  when(undefined, () => TopLevel.of()),
  when(Any, () => section),
)
```

This is a simplified version of the `withPath()` we had in the top-level 
module, because this time do not need to calculate the route parameters. 
Remember how we were passing the route parameters to each page module's `init()` 
function? In this module, we are simply using the first parameter as the 
`section` argument.

The initial model is either a `TopLevel` object if no section was found in 
the path (`#about`), or a string representing the section name. We did not 
initialize the section module's state because we are dealing with simple 
pages with static content. If we had to, we could do something like this:

```javascript
let init = section => match(SECTION_MODULES[section],
  when(undefined, () => TopLevel.of()),
  when(Any, module => ({
    section,
    sectionModel: module.init(),
  }),
)
```

At any rate, we have to store the active section in the module, because we 
want to later retrieve the module from our `SECTION_MODULES` map.

The update function doesn't do anything in this module as the example only 
uses static content.

The view function renders the links to the sections if the model is `TopLevel`,
and otherwise renders the contents of the section's `view()`:

```javascript
let topLevelView = div([],
  ul([],
    li([], a([href('#about/foo')], 'Foo')),
    li([], a([href('#about/bar')], 'Bar')),
  ),
)

let view = model => (
  div([],
    h1([], 'About stuff'),
    match(model,
      when(TopLevel, topLevelView),
      when(Any, () => SECTION_MODULES[model].view())
    ),
    p([], a([href('#')], 'Home'))
  )
)
```

## See also

- [Extending Movium](./extending-movium.md)
