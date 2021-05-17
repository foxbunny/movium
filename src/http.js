import { match, when } from './patternMatching'
import { Any, Type } from './types'

let HttpRequest = Type.of({
  expect (expecter) {
    return expecter(fetch(this.url, this.options))
  },
})
let HttpResponse = Type.of()
let HttpError = HttpResponse.of()
let HttpRequestError = HttpError.of()
let HttpResult = HttpResponse.of()
let JSONData = Type.of()
let XFormData = Type.of()
let MultipartData = Type.of()

let request = (method, url, options) =>
  HttpRequest.of({ url, options: { ...options, method } })
let requestOptions = (data, options) => match(data,
  when(JSONData, data => ({
    ...options,
    body: JSON.stringify(data),
    headers: { ...options?.headers, 'Content-Type': 'application/json' },
  })),
  when(XFormData, data => {
    let f = new URLSearchParams()
    for (let key in data) f.append(key, data[key])
    return { ...options, body: f }
  }),
  when(MultipartData, data => {
    let f = new FormData()
    for (let key in data) f.append(key, data[key])
    return { ...options, body: f }
  }),
  when(Any, () => ({ ...options, body: data })),
)
let GET = (url, options) => request('GET', url, options)
let POST = (url, data, options) => request('POST', url, requestOptions(data, options))
let PUT = (url, data, options) => request('PUT', url, requestOptions(data, options))
let PATCH = (url, data, options) => request('PATCH', url, requestOptions(data, options))
let DELETE = (url, data, options) => request('DELETE', url, requestOptions(data, options))

let expecter = getter => promise => promise
  .then(res => res.ok
    ? getter(res).then(data => HttpResult.val(data))
    : HttpError.val(res.status),
  )
  .catch(err => HttpRequestError.val(err))

let jsonResponse = expecter(res => res.json())
let textResponse = expecter(res => res.text())

export {
  HttpRequest,
  HttpResponse,
  HttpError,
  HttpResult,
  HttpRequestError,
  JSONData,
  XFormData,
  MultipartData,
  request,
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  jsonResponse,
  textResponse,
}

