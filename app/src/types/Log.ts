export type LogType = 'info' | 'warn' | 'error' | 'dump'

export type LogEntry =
  | { type: 'dump'; value: any; count: number }
  | { type: 'info' | 'warn' | 'error'; value: string; count: number }
