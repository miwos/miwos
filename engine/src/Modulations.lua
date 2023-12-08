Modulations = {
  ---@type Modulation[]
  list = {},
}

---@param serialized ModulationSerialized[]
function Modulations.deserialize(serialized)
  for _, modulation in ipairs(serialized) do
    -- https://github.com/LuaLS/lua-language-server/issues/1353
    ---@diagnostic disable-next-line: param-type-mismatch
    Modulations.add(unpack(modulation))
  end
end

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

function Modulations.clear()
  Modulations.list = {}
  Miwos:emit('patch:change')
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

function Modulations.update(time, updateApp)
  local modulatorValues = {}
  local updateSerialized = {}

  for id, item in pairs(Items.instances) do
    if item.__definition.category == 'modulators' then
      ---@cast item Modulator

      local value = item:value(time)
      modulatorValues[id] = value

      updateSerialized[#updateSerialized + 1] = Utils.packBytes(0, id)
      updateSerialized[#updateSerialized + 1] = value
    end
  end

  for _, modulation in pairs(Modulations.list) do
    local modulator, item, prop, amount = unpack(modulation)
    -- https://github.com/LuaLS/lua-language-server/issues/135
    ---@cast modulator -string, -number, -Item
    ---@cast item Item

    if modulator and item then
      local type, options = unpack(item.__definition.props[prop])
      local definition = Miwos.definitions.props[type]

      local baseValue = item.props.__values[prop]
      local modulationValue = modulatorValues[modulator.__id]
      local value =
        definition.modulateValue(baseValue, modulationValue, amount, options)

      Items.updateModulatedProp(item, prop, value)
      updateSerialized[#updateSerialized + 1] =
        Utils.packBytes(1, item.__id, options.index)
      updateSerialized[#updateSerialized + 1] = value
    end
  end

  if Utils.option(updateApp, true) and #updateSerialized > 0 then
    Bridge.notify('/n/modulations/update', unpack(updateSerialized))
  end
end
