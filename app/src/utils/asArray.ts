export const asArray = (v: any) =>
  Array.isArray(v) ? v : v === undefined ? [] : [v]
