declare module 'lua-json' {
  export function format(
    value: any,
    options?: {
      eol: string = '\n'
      singleQuote: boolean
      spaces: null | number | string
    }
  ): string
  export function parse(value: string): any
}
