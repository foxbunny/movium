# HTTP

Although not all apps need to talk to web servers, most do. Therefore, Movium
provides an out-of-the-box solution for performing HTTP requests.

## Contents

<!-- vim-markdown-toc GFM -->

* [Creating requests](#creating-requests)
* [Obtaining a response](#obtaining-a-response)
* [Handling responses](#handling-responses)
* [Making requests as tasks](#making-requests-as-tasks)
* [See also](#see-also)

<!-- vim-markdown-toc -->

## Creating requests

Requests are made using one of the five functions that correspond to HTTP verbs:

- `GET(url, options)`
- `POST(url, data, options)`
- `PUT(url, data, options)`
- `PATCH(url, data, options)`
- `DELETE(url, data, options)`

When called, these functions return a `HttpRequest` object, which is simply a
set of parameters related to the request. They do not execute the request right
away.

```javascript
import { GET } from 'movium'

let request = GET('/test')
```

When making POST/PUT/PATCH/DELETE requests, the `data` parameter can be a value
object creating one of the Movium's built-in prototypes:

- `JSONData` - JSON data
- `XFormData` - URL-encoded form data
- `MultipartData` - Multipart form data

The value of the value object should be an object, and it is encoded using
appropriate methods.

Here's an example using `JSONData` value object in a POST request:

```javascript
import { POST, JSONData } from 'movium'

let request = POST('/test', JSONData.val({ foo: 'bar' }))
```

Alternatively, `data` can be a manually encoded object of any type supported by
the `body` parameter in `fetch()`, or `undefined` if request data should be
omitted.

The `options` object passed to each of the HTTP functions is the usual init
parameters for the [`fetch()` function](https://mzl.la/3i1tv48). Here's an
example of specifying an authorization header:

```javascript
import { POST, JSONData } from 'movium'

let request = POST('/test', JSONData.val({ foo: 'bar' }), {
  headers: {
    Authorization: 'Bearer someToken',
  },
})
```

## Obtaining a response

In order to execute the request, we need to 'expect' a result. So-called
expecters are functions that will process the response with different
assumptions based on the function used. Movium provides two expecters: one for
JSON responses, and one for text responses. Expecters are passed to the request
by calling the `expect()` method on the request object. This returns a promise
that will resolve to the result of the request.

```javascript
import { GET, jsonResponse } from 'movium'

GET('/test').expect(jsonResponse)
  .then(resultOrError => {
    // ...
  })
```

## Handling responses

The result of executing a HTTP request is either a `HttpResult` or a
`HttpError` object. The `HttpError` object can either be a `HttpBadResponse`
object, which is returned in case of a bad response and contains the status code
of the response, and the response body if it can be parsed by the expecter, or
of a `HttpRequestError` subtype which is returned when the request could not be
made at all (e.g., could not encode the request data, or network connection
error), and contains an `Error` object.

The `HttpBadResponse` object is further specialized for a subset of HTTP
response codes:

- 400 `HttpInvalidRequest`
- 401 `HttpUnauthorized`
- 403 `HttpForbidden`
- 404 `HttpMissing`
- 408 `HttpTimeout`
- 409 `HttpConflict`
- 410 `HttpGone`
- 422 `HttpInvalidRequest`
- 500 `HttpServerError`

The rest of the status codes use `HttpBadResponse`.

We typically handle responses by
using [pattern matching](./pattern-matching.md):

```javascript
import { 
  GET, 
  jsonResponse, 
  HttpResult, 
  HttpBadResponse, 
  HttpRequestError,
  match, 
  when,
} from 'movium'

GET('/test').expect(jsonResponse)
  .then(result => match(result,
    when(HttpResult, data => alert('Got data!')),
    when(HttpBadResponse, data => alert('Too bad...'))
    when(HttpRequestError, () => alert('Please check your connection'))
  ))
```

The `HttpError` objects, except the `HttpRequestError`, are value objects that
contain the parsed response data. If you are handling the more exotic HTTP
status codes that are not represented by one of the descriptive prototypes, you
can also access the `status` property on the value object by using
`whenRaw()` instead of `when()` in the pattern matching:

```javascript
GET('/test').expect(jsonResponse)
  .then(result => match(result,
    when(HttpResult, data => alert('Got data!')),
    whenRaw(HttpError, resp => alert(resp.status))
  ))
```

In cases where the response body cannot be parsed by the expecter, the 
response body is `undefined` and no errors are thrown.

## Making requests as tasks

We don't normally use the HTTP functions outside of the update function
(although there's nothing to stop us from doing so). When using then within an
update function, we typically use tasks for the purpose:

```javascript
import { 
  GET, 
  jsonResponse, 
  HttpResult, 
  HttpBadResponse, 
  HttpRequestError,
  Type,
  Msg,
  match, 
  when,
  Task,
} from 'movium'

let Blank = Type.of()
let Loading = Type.of()
let Loaded = Type.of()
let Failed = Type.of()

let init = () => Blank.of()

let FetchData = Msg.of()
let ReceiveData = Msg.of()

let update = (msg, model) => match(msg,
  when(FetchData, () => Task.from(
    Loading.of(),
    GET('/test').expect(jsonResponse),
    ReceiveData,
  )),
  when(ReceiveData, result => match(result
    when(HttpResult, data => Loaded.of(data)),
    when(HttpBadResponse, () => Failed.of())
  )),
)
```

In this example, we have four possible stats in which the model can be,
represented by the prototypes `Blank`, `Loading`, `Loaded`, and `Failed`. We
have two messages:

- `FetchData`, which initializes the request
- `ReceiveData`, which handles the result

When we send the `FetchData` message, the model is immediately changed to a
`Loading` object, and, at the same time, a GET request is sent to `/test`,
expecting some JSON data as a result. The `ReceiveData` is specified as the
target for the result.

The `RreceiveData` message is sent out once the request is completed, and the
result is pattern-matched to change the model into either the `Loaded` or
`Failed` state.

This pattern usually covers most of the common cases. For a small application
that demonstrates this pattern see [async tasks](../guides/async-tasks.md).

## See also

- [Framework functions](./framework-functions.md)
- [HTML](./html.md)
- [Snabbdom modules]('./snabbdom-modules.md')
- [Types](./types.md)
- [Pattern Matching](./pattern-matching.md)
- [Tools](./tools.md)
