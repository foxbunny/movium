# Widgets

Widgets is a term used to denote non-mvu UI elements in an MVU app.

When writing MVU apps, we may be tempted to manage the UI state entirely in the
model. However, this may sometimes result in UI elements that are too
micro-managed, presenting a big burden on the `update()` function, and posing
unique challenges for the application structure.

For instance, if we have a select list element in our app, we don't normally
want to manage in our model the state of the element (e.g., whether it is open
or closed). This is handled by the browser, and we are happy with that. When it
comes to custom UI elements that we create, we don't want to start pushing the
element's state in our model just because that's 'how things are done in MVU.'

In this chapter, we will show an ancient pattern for constructing elements that
do not affect the application state, and behaves pretty much like any HTML
element. The code in this chapter can be found in fully working state in
the `examples` folder.

## The widget

The widget we are implementing is an editable text widget. It will be rendered
as a plain span with a hidden input element, and when clicked, it swaps the
input, and the span, by toggling their `display` CSS properties via classes.

Let's first look at the code for the widget:

```javascript
let editableText = options => (
  span(['editable-text'],
    input([
      'editable-text-input',
      value(options.value),
      onInput(options.onInput),
      onBlur(deactivateEditableText),
      onKey('Escape', deactivateEditableText),
      onKey('Enter', deactivateEditableText),
    ]),
    span([
        'editable-text-display editable-text-active',
        tabIndex(0),
        onClick(activateEditableText),
        onKey('Enter', activateEditableText),
      ],
      options.value,
    ),
  )
)
```

Elements without the `editable-text-active` class are not shown. So this widget
starts with the span shown, and input hidden. The span contains the
`options.value`. The input has the value `options.value`, and will emit the
`options.onInput` message (or call the `options.onInput` function) when the
`input` event is triggered on it.

We can see that `deactivateEdtiableText` and `activateEditableText`
functions are used in several places to activate or deactivate the widget. Let's
take a look at those, the meat of the widget:

```javascript
let activateEditableText = (_1, _2, vnode) => {
  let self = vnode.elm
  self.classList.remove('editable-text-active')
  self.previousSibling.classList.add('editable-text-active')
  self.previousSibling.focus()
}
let deactivateEditableText = (_1, _2, vnode) => {
  let self = vnode.elm
  self.classList.remove('editable-text-active')
  self.nextSibling.classList.add('editable-text-active')
  self.nextSibling.focus()
}
```

Both functions are event handlers. (If you are no familiar with how event
handlers work in Movium, look at
[Manual event handling](../library/html.md#manual-event-handling) for more
details.)

In both event handlers, we ignore the first and second arguments, and we use
the `vnode` argument to get access to the element on which the event is
triggered. We could have also used the second argument, which is the `Event`
object, and used `event.target`. It does not make any difference.

We select the other element by using `nextSibling` or `previousSibling`
properties on the event target. For the input element, `nextSibling` is the
span, and vice versa. Activating the widget means removing the
`editable-text-active` class from the span, and adding it to the input. To
deactivate the widget, we do the opposite. Finally, we focus the other element
in each case.

The important thing to note is that we never call the updater to emit any
messages while we are managing the widget state. It's all done at the DOM level.
In fact, even though the `editable-text-active` class *is* set using Snabbdom (
virtual DOM) initially, it is never ever changed through the virtual DOM, and is
therefore perfectly safe to toggle it using direct DOM manipulation in our event
handlers.

**SIDENOTE:** This pattern of state management is called 'DOM-infused state' and
was once upon a time used profusely in the
[jQuery](https://en.wikipedia.org/wiki/JQuery) era.

## The widget in action

Let's take a look at the application code that uses this widget. First the
`init()` function:

```javascript
let init = () => 'Hello, world'
```

Since we only need the text for the widget, the `init()` in our case simply
returns a string.

The `update()` function is just as simple:

```javascript
let SetText = Msg.of()

let update = msg => match(msg,
  when(SetText, id),
)
```

To update the model, we simply use the identity function, which will receive the
updated text from the widget and return it as the new model.

The view is also simple, very similar to just creating a new element:

```javascript
let view = model => (
  div([],
    editableText({ value: model, onInput: SetText }),
  )
)
```

Of course, the format in which we pass the props is a little difference since we
are not passing real DOM properties, but just parameters to a normal function,
but if you squint, it is almost like a normal element. :p

## When to use widgets

Although widgets can greatly simplify the design of the application in some
cases, they may also complicate things in others. In general, you should not shy
away from including some UI-related state in the model.

The general rule of thumb is that a widget should be completely self-contained,
and not depend on other parts of the application to work.

For example, a custom select list, or a widget like the editable text we've seen
here, are good candidates. Everything they need to know about their state is
contained within them, and they manage their own state on their own.

Things like modal dialogs, on the other hand, are not. The application must have
some way of opening the modal dialog, which means that the widget would need to
receive some state from the outside (whether it is open or not). The application
may also need to know whether the dialog is open or not.

Widgets also need to be relatively simple, or they may quickly get out of hand.
If you ever run into a case where you need to integrate a 3rd party library, or
create a complex widget that may need to integrate tightly into the MVU pattern
but still have complex DOM manipulation (e.g., charting, video players, etc),
you may want to consider creating a snabbdom module instead (see
[Extending Movium](./extending-movium.md)).

## See also

- [Extending movium](./extending-movium.md)
