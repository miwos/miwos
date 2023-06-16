import { format } from 'lua-json'

export const jsonToLua = (json: any) => {
  const lua = format(json)
  // Numerical keys are lost in serialization (because we have to convert maps
  // to objects which can't have numerical keys in js). To preserve them we
  // remove the quotes from all keys that are number strings.
  return lua.replace(/\['(\d+)']/g, (_: string, id: string) => `[${id}]`)
}
