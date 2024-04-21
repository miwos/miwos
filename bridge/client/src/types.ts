import { type MessageArgValue } from "@miwos/osc/src/types"

export interface Message {
  address: string
  args: MessageArgValue[]
}

export interface DirItem {
  name: string
  type: 'directory' | 'file'
  children?: DirItem[]
}

export type Dir = DirItem[]
