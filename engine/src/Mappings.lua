Mappings = {
  ---@type MappingPage[]
  pages = {},
}

---@param serialized MappingPageSerialized[]
function Mappings.deserialize(serialized)
  for index, page in pairs(serialized or {}) do
    for slot, mapping in pairs(page) do
      -- https://github.com/LuaLS/lua-language-server/issues/1353
      ---@diagnostic disable-next-line: param-type-mismatch
      Mappings.add(index, slot, unpack(mapping))
    end
  end
end

---@param page number
---@param slot number
---@param id number
---@param prop string
function Mappings.add(page, slot, id, prop)
  Mappings.pages[page] = Mappings.pages[page] or {}
  local item = Items.instances[id]
  if not item then error(Log.messageItemNotFound(id)) end
  Mappings.pages[page][slot] = { item, prop }
  Miwos:emit('patch:change')
end

---@param page number
---@param slot number
function Mappings.remove(page, slot)
  if not Mappings.pages[page] then return end
  Mappings.pages[page][slot] = nil
  Miwos:emit('patch:change')
end

function Mappings.clear()
  Mappings.pages = {}
  Miwos:emit('patch:change')
end
