import { renderToDOM } from './__test__/snabbdom'
import { Delayed, Destroy } from './html'
import * as html from './html'

describe('elements', () => {
  test.each([
    ['a', 'A'],
    ['abbr', 'ABBR'],
    ['address', 'ADDRESS'],
    ['area', 'AREA'],
    ['article', 'ARTICLE'],
    ['aside', 'ASIDE'],
    ['audio', 'AUDIO'],
    ['b', 'B'],
    ['base', 'BASE'],
    ['bdi', 'BDI'],
    ['bdo', 'BDO'],
    ['blockquote', 'BLOCKQUOTE'],
    ['body', 'BODY'],
    ['br', 'BR'],
    ['button', 'BUTTON'],
    ['canvas', 'CANVAS'],
    ['caption', 'CAPTION'],
    ['cite', 'CITE'],
    ['code', 'CODE'],
    ['col', 'COL'],
    ['colgroup', 'COLGROUP'],
    ['data', 'DATA'],
    ['datalist', 'DATALIST'],
    ['dd', 'DD'],
    ['del', 'DEL'],
    ['details', 'DETAILS'],
    ['dfn', 'DFN'],
    ['dialog', 'DIALOG'],
    ['div', 'DIV'],
    ['dl', 'DL'],
    ['dt', 'DT'],
    ['em', 'EM'],
    ['embed', 'EMBED'],
    ['fieldset', 'FIELDSET'],
    ['figcaption', 'FIGCAPTION'],
    ['figure', 'FIGURE'],
    ['font', 'FONT'],
    ['footer', 'FOOTER'],
    ['form', 'FORM'],
    ['head', 'HEAD'],
    ['header', 'HEADER'],
    ['hgroup', 'HGROUP'],
    ['h1', 'H1'],
    ['h2', 'H2'],
    ['h3', 'H3'],
    ['h4', 'H4'],
    ['h5', 'H5'],
    ['h6', 'H6'],
    ['hr', 'HR'],
    ['html', 'HTML'],
    ['i', 'I'],
    ['iframe', 'IFRAME'],
    ['img', 'IMG'],
    ['input', 'INPUT'],
    ['ins', 'INS'],
    ['kbd', 'KBD'],
    ['keygen', 'KEYGEN'],
    ['label', 'LABEL'],
    ['legend', 'LEGEND'],
    ['li', 'LI'],
    ['link', 'LINK'],
    ['main', 'MAIN'],
    ['map', 'MAP'],
    ['mark', 'MARK'],
    ['menu', 'MENU'],
    ['menuitem', 'MENUITEM'],
    ['meta', 'META'],
    ['meter', 'METER'],
    ['nav', 'NAV'],
    ['object', 'OBJECT'],
    ['ol', 'OL'],
    ['optgroup', 'OPTGROUP'],
    ['option', 'OPTION'],
    ['output', 'OUTPUT'],
    ['p', 'P'],
    ['param', 'PARAM'],
    ['picture', 'PICTURE'],
    ['pre', 'PRE'],
    ['progress', 'PROGRESS'],
    ['q', 'Q'],
    ['rp', 'RP'],
    ['rt', 'RT'],
    ['ruby', 'RUBY'],
    ['s', 'S'],
    ['samp', 'SAMP'],
    ['script', 'SCRIPT'],
    ['section', 'SECTION'],
    ['select', 'SELECT'],
    ['small', 'SMALL'],
    ['source', 'SOURCE'],
    ['span', 'SPAN'],
    ['strong', 'STRONG'],
    ['sub', 'SUB'],
    ['summary', 'SUMMARY'],
    ['sup', 'SUP'],
    ['svg', 'svg'],
    ['table', 'TABLE'],
    ['tbody', 'TBODY'],
    ['td', 'TD'],
    ['template', 'TEMPLATE'],
    ['textarea', 'TEXTAREA'],
    ['tfoot', 'TFOOT'],
    ['th', 'TH'],
    ['thead', 'THEAD'],
    ['time', 'TIME'],
    ['title', 'TITLE'],
    ['tr', 'TR'],
    ['track', 'TRACK'],
    ['u', 'U'],
    ['ul', 'UL'],
    ['variable', 'VAR'],
    ['video', 'VIDEO'],
    ['wbr', 'WBR'],
  ])(
    'create an element %s',
    (fnName, nodeName) => {
      let renderFn = html[fnName]()
      expect(typeof renderFn).toBe('function')

      let { elm } = renderToDOM(renderFn(() => {}))
      expect(elm.nodeName).toBe(nodeName)
    },
  )
})

describe('key', () => {
  test('add a key to a vnode', () => {
    let x = html.a([html.key('testKey')])
    let vnode = x(() => {})
    expect(vnode.key).toBe('testKey')
  })
})

describe('classes', () => {
  test('add class by using string prop', () => {
    let x = html.a(['my-class'])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
    })
  })

  test('add multiple classes using a single string prop', () => {
    let x = html.a(['my-class your-class'])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
      'your-class': true,
    })
  })

  test('add class by using className prop', () => {
    let x = html.a([html.className('my-class')])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
    })
  })

  test('add multiple classes using className prop', () => {
    let x = html.a([html.className('my-class your-class')])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
      'your-class': true,
    })
  })

  test('turn a class off with use flag', () => {
    let x = html.a([html.className('my-class', false)])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': false,
    })
  })

  test('add multiple classes using multiple className props', () => {
    let x = html.a([html.className('my-class'), html.className('your-class')])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
      'your-class': true,
    })
  })

  test('toggle some of the classes when using multiple className props', () => {
    let x = html.a(['my-class', html.className('your-class', false)])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
      'your-class': false,
    })
  })

  test('add a delayed class', () => {
    let x = html.a(['my-class', html.className(Delayed.val('your-class'))])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
      delayed: {
        'your-class': true,
      },
    })
  })

  test('remove class with delay', () => {
    let x = html.a(['my-class your-class', html.className(Delayed.val('your-class'), false)])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
      'your-class': true,
      delayed: {
        'your-class': false,
      },
    })
  })

  test('add destroy class', () => {
    let x = html.a(['my-class', html.className(Destroy.val('your-class'))])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
      destroy: {
        'your-class': true,
      },
    })
  })

  test('remove class on destroy', () => {
    let x = html.a(['my-class', html.className(Destroy.val('my-class'), false)])
    let vnode = x(() => {})
    expect(vnode.data.class).toEqual({
      'my-class': true,
      destroy: {
        'my-class': false,
      },
    })
  })
})

describe('props', () => {
  test.each([
    ['value', 'value'],
    ['type', 'type'],
    ['contentEditable', 'contentEditable'],
    ['tabIndex', 'tabIndex'],
    ['disabled', 'disabled'],
    ['placeholder', 'placeholder'],
    ['src', 'src'],
    ['href', 'href'],
    ['name', 'name'],
    ['id', 'htmlId'],
    ['for', 'htmlFor'],
    ['alt', 'alt'],
    ['title', 'htmlTitle'],
  ])(
    'add a prop "%s" using %s()',
    (propName, method) => {
      let x = html.a([html[method]('myVal')])
      let vnode = x(() => {})
      expect(vnode.data.props[propName]).toEqual('myVal')
    },
  )
})
