**NOTES:**

- Versions and features marked with 💣 are backwards-incompatible.
- Semver is not observed prior to version 1.0.0.
- Until version 1.0.0, the author **will** be liberal with breaking changes 
  to flesh out the API as early as possible.
  
# 0.5.1

- Fix rendering loop stopping completely when identical model is returned 
  from an update
  
# 0.5.0 💣

- 💣 Make response body (instead of status code) available through the 
  `HttpBadResponse` value objects; status can be accessed via its `status` 
  property
  
# 0.4.1

- Ensure no-render is performed when task returns a model that is identical 
  to the previous one.
  
# 0.4.0 💣

- Expand event handlers so that plain functions can be used in place of messages
- Export functions for creating custom event handlers
- Add special events on the `window` object via `on*Window()` event listener 
  props and new `windowEventListeners` Snabbdom module
- Add `onHashchange()`, `onPopstate()`, `onResize()`, 
  `onOrientationChange()`, and `onScroll()` event listener props
- Extend `is()` to be able to match `undefined` and `null` by using them as the 
  type rather than having to use `Undefined` and `Null` (although the latter 
  can still be used)
- Add `prevented()`, `noPropagation()` and `debounced()` event modifiers
- 💣 Removed `prevent()` and `stopPropagation()`
- Cleaned up examples, and added examples for the debouncing, routing, and 
  non-MVU widgets
- Expanded the documentation to cover new features, and also routing and widgets
- Expanded the documentation to cover initializing the state asynchronously 
  in the Async tasks chapter

# 0.3.0 💣

- 💣 Rename `assignPath` to `patch()`
- 💣 Make `patch()` return the source object as is if target value is
  identical to new value
- 💣 Change the `render()` behavior to avoid re-rendering if updated model is
  identical to the current one
- 💣 Remove the `DoNothing` type
- Add `using()` for improved cosmetics :P

# 0.2.0

- Add Task.delegate() and delegate() functions for delegating model/task updates
  from other modules
- Add `whenRaw()` to prevent value object unpacking during pattern matching
- Fixed the broken `log()` function

# 0.1.4

- Fix missing `onChange` and `onFocus` exports
- Improve demo index page styling
- Add example for switching themes using `styule()`

# 0.1.3

- First working release
