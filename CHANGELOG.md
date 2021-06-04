**NOTES:**

- Versions and features marked with 💣 are backwards-incompatible.
- Semver is not observed prior to version 1.0.0.
- Until version 1.0.0, the author **will** be liberal with breaking changes 
  due to flesh out the API as early as possible.

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
