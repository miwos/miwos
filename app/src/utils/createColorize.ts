// Based on https://github.com/usmanyunusov/colorize-template
// (which somehow didn't work as an npm import)

// The MIT License (MIT)

// Copyright 2021 Usman Yunusov <usman.iunusov@gmail.com>

// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

export type Colors = Record<string, (input: string) => string>

export const createColorize = (colors: Colors = {}) => {
  let MARKS = Object.keys(colors).toString().replace(/,/g, '|')
  let RE_BLOCK = new RegExp(
    `\\{((?:${MARKS})(?:\\.(?:${MARKS}))*?)\\s|(\\})|(.[^{}]*)`,
    'gi'
  )

  return (strings: TemplateStringsArray, ...args: any) => {
    const input = strings.reduce((a, s, i) => (a += args[--i] + s))
    let stack: { marks: string[]; raw: string }[] = [{ marks: [], raw: '' }]

    input.replace(RE_BLOCK, (block, open, close, other = '', pos) => {
      if (open) {
        other = block
        if (input.indexOf('}', pos) + 1) {
          stack.push({ marks: open.split('.').reverse(), raw: '' })
          return ''
        }
      }

      if (close) {
        other = block
        if (stack.length !== 1) {
          let { marks, raw } = stack.pop()!
          other = marks.reduce((acc, mark) => colors[mark](acc), raw)
        }
      }

      stack[stack.length - 1].raw += other
      return ''
    })

    return stack[0].raw
  }
}
