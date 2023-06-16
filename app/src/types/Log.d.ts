export type LogType = 'info' | 'warn' | 'error' | 'dump'

export interface LogEntry {
  text: string
  type: LogType
  count: number
}
