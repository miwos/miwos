import { parse } from 'lua-json'

export const luaToJson = <T>(lua: string): T =>
  parse(lua.startsWith('return ') ? lua : `return ${lua}`)
