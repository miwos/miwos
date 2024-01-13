import { parse } from 'lua-json'

export const luaToJson = <T>(lua: any): T =>
  typeof lua === 'string'
    ? parse(lua.startsWith('return ') ? lua : `return ${lua}`)
    : lua
