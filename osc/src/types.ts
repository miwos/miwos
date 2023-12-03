export type MessageArgType =
  | 'i'
  | 'f'
  | 's'
  | 'b'
  | 'h'
  | 't'
  | 'd'
  | 'T'
  | 'F'
  | 'N'
  | 'I'

export type MessageArgValue =
  | number
  | string
  | boolean
  | null
  | bigint
  | Blob
  | Uint8Array

export interface MessageArgObject {
  type: MessageArgType
  value: MessageArgValue
}
