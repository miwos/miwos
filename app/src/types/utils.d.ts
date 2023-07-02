export type KeysStartWith<T, P extends string> = {
  [K in keyof T as K extends `${P}${infer _}` ? K : never]: T[K]
}
