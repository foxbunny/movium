import {
  DELETE,
  GET,
  HttpRequest,
  JSONData,
  XFormData,
  MultipartData,
  PATCH,
  POST,
  PUT,
  jsonResponse,
  HttpResult, HttpError, HttpRequestError, HttpResponse, textResponse, HttpInvalidRequest,
} from './http'
import { is } from './types'

const { request } = require('./http')

describe('request', () => {
  test('create a request', () => {
    let r = request('GET', 'http://example.com/')
    expect(is(HttpRequest, r)).toBe(true)
    expect(r.url).toBe('http://example.com/')
    expect(r.options).toEqual({
      method: 'GET',
    })
  })

  test('create a request with options', () => {
    let r = request('GET', 'http://example.com/', { headers: { 'Authorization': 'Bearer 123' } })
    expect(is(HttpRequest, r)).toBe(true)
    expect(r.url).toBe('http://example.com/')
    expect(r.options).toEqual({
      method: 'GET',
      headers: { 'Authorization': 'Bearer 123' },
    })
  })
})

describe('GET', () => {
  test('create a GET request', () => {
    let r = GET('http://example.com/')
    expect(is(HttpRequest, r)).toBe(true)
    expect(r.url).toBe('http://example.com/')
    expect(r.options).toEqual({
      method: 'GET',
    })
  })

  test('create a GET request with options', () => {
    let r = GET('http://example.com/', { headers: { 'Authorization': 'Bearer 123' } })
    expect(is(HttpRequest, r)).toBe(true)
    expect(r.url).toBe('http://example.com/')
    expect(r.options).toEqual({
      method: 'GET',
      headers: { 'Authorization': 'Bearer 123' },
    })
  })
})

describe.each([
  ['POST', POST],
  ['PUT', PUT],
  ['PATCH', PATCH],
  ['DELETE', DELETE],
])(
  '%s',
  (method, factory) => {
    test(`create a ${method} request`, () => {
      let r = factory('http://example.com/')
      expect(is(HttpRequest, r)).toBe(true)
      expect(r.url).toBe('http://example.com/')
      expect(r.options).toEqual({
        method,
      })
    })

    test(`create a ${method} request with JSON data`, () => {
      let r = factory('http://example.com/', JSONData.val({ foo: 'bar' }))
      expect(is(HttpRequest, r)).toBe(true)
      expect(r.url).toBe('http://example.com/')
      expect(r.options).toEqual({
        method,
        body: '{"foo":"bar"}',
        headers: { 'Content-Type': 'application/json' },
      })
    })

    test(`create a ${method} request with form data`, () => {
      let r = factory('http://example.com/', XFormData.val({ foo: 'bar' }))
      expect(is(HttpRequest, r)).toBe(true)
      expect(r.url).toBe('http://example.com/')
      expect(r.options).toEqual({
        method,
        body: new URLSearchParams([['foo', 'bar']]),
      })
    })

    test(`create a ${method} request with multipart form data`, () => {
      let expected = new FormData()
      expected.append('foo', 'bar')

      let r = factory('http://example.com/', MultipartData.val({ foo: 'bar' }))
      expect(is(HttpRequest, r)).toBe(true)
      expect(r.url).toBe('http://example.com/')
      expect(r.options).toEqual({
        method,
        body: expected,
      })
    })

    test(`create ${method} request with arbitrary body`, () => {
      let r = factory('http://example.com/', 'data')
      expect(is(HttpRequest, r)).toBe(true)
      expect(r.url).toBe('http://example.com/')
      expect(r.options).toEqual({
        method,
        body: 'data',
      })
    })

    test(`create ${method} request with options`, () => {
      let r = factory('http://example.com/', 'data', { headers: { 'Content-Type': 'text/plain' } })
      expect(is(HttpRequest, r)).toBe(true)
      expect(r.url).toBe('http://example.com/')
      expect(r.options).toEqual({
        method,
        body: 'data',
        headers: { 'Content-Type': 'text/plain' },
      })
    })
  },
)

describe('jsonResponse', () => {
  afterEach(() => fetch.resetMocks())

  test('expect a JSON response', (done) => {
    fetch.mockResponseOnce('{"foo":"bar"}')

    GET('http://exampole.com/')
      .expect(jsonResponse)
      .then(result => {
        expect(is(HttpResponse, result)).toBe(true)
        expect(is(HttpResult, result)).toBe(true)
        expect(result.value).toEqual({ foo: 'bar' })
      })
      .then(done)
  })

  test('expect a JSON response with error', (done) => {
    fetch.mockResponseOnce('{"foo":"bar"}', { status: 400 })

    GET('http://example.com/')
      .expect(jsonResponse)
      .then(result => {
        expect(is(HttpResponse, result)).toBe(true)
        expect(is(HttpError, result)).toBe(true)
        expect(is(HttpInvalidRequest, result)).toBe(true)
        expect(result.value).toBe(400)
      })
      .then(done)
  })

  test('expect JSON response with network failure', (done) => {
    fetch.mockRejectOnce(Error('Network error'))

    GET('http://example.com/')
      .expect(jsonResponse)
      .then(result => {
        expect(is(HttpResponse, result)).toBe(true)
        expect(is(HttpError, result)).toBe(true)
        expect(is(HttpRequestError, result)).toBe(true)
        expect(result.value).toEqual(Error('Network error'))
      })
      .then(done)
  })
})

describe('textResponse', () => {
  afterEach(() => fetch.resetMocks())

  test('get text response', (done) => {
    fetch.mockResponseOnce('{"foo":"bar"}')

    GET('http://exampole.com/')
      .expect(textResponse)
      .then(result => {
        expect(is(HttpResponse, result)).toBe(true)
        expect(is(HttpResult, result)).toBe(true)
        expect(result.value).toEqual('{"foo":"bar"}')
      })
      .then(done)
  })
})
