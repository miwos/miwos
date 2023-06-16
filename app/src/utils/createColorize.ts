// Based on https://github.com/usmanyunusov/colorize-template
// (which somehow didn't work as an npm import)

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
