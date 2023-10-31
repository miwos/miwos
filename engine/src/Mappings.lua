Mappings = {
  ---@type MappingPage[]
  pages = {},
}

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
