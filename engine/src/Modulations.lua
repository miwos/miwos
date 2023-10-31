Modulations = {
  ---@type Modulation[]
  list = {},
}

---@param item Item
---@param prop string
function Modulations.getByItem(item, prop)
  for _, modulation in pairs(Modulations.list) do
    if modulation[2] == item and modulation[3] == prop then
      return modulation
    end
  end
end

---@param modulatorId number
---@param itemId number
---@param prop string
---@param amount number
function Modulations.add(modulatorId, itemId, prop, amount)
  local modulator = Items.instances[modulatorId] --[[@as Modulator]]
  if not modulator then error(Log.messageItemNotFound(modulatorId)) end

  local item = Items.instances[itemId]
  if not item then error(Log.messageItemNotFound(itemId)) end

  Modulations.list[#Modulations.list + 1] = { modulator, item, prop, amount }
  Miwos:emit('patch:change')
end

---@param modulatorId number
---@param itemId number
---@param prop string
function Modulations.remove(modulatorId, itemId, prop)
  for i, modulation in pairs(Modulations.list) do
    if
      modulation[1].__id == modulatorId
      and modulation[2].__id == itemId
      and modulation[3] == prop
    then
      Modulations.list[i] = nil
      Miwos:emit('patch:change')
      return
    end
  end
end

---@param modulatorId number
---@param itemId number
---@param prop string
---@param amount number
function Modulations.updateAmount(modulatorId, itemId, prop, amount)
  for _, modulation in pairs(Modulations.list) do
    if
      modulation[1].__id == modulatorId
      and modulation[2].__id == itemId
      and modulation[3] == prop
    then
      modulation[4] = amount
      return
    end
  end
end
