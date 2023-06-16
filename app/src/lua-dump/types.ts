export type Formatter = (value: any, type: TokenType) => string

export type TokenType =
  | 'specialKey'
  | 'key'
  | 'complexType'
  | 'number'
  | 'boolean'
  | 'string'
