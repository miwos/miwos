export type KeysStartWith<T, P extends string> = {
  [K in keyof T as K extends `${P}${infer _}` ? K : never]: T[K]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>
