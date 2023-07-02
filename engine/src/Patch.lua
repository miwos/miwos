local class = require('class')

---@class Patch: Class
---@field items table<number, Item>
---@field modulations { [1]: Modulator, [2]: Item, [3]: string, [4]: number }[]
---@field mappings { [1]: Item, [2]: string }[]
local Patch = class()

function Patch:constructor()
  self.items = {}
  self.connections = {}
  self.modulations = {}
  self.mappings = {}
end

---Add a new item
---@param id number
---@param category ItemCategory
---@param type string
---@param props table<string, any>
---@return boolean
function Patch:addItem(id, category, type, props)
  local definitions = Miwos.definitions[category]
  if not definitions then
    error(string.format('definitions for category `%s` not found', category))
  end

  local definition = definitions[type]
  if not definition then
    error(string.format('definition for item `%s` not found', type))
  end

  if self.items[id] then
    error(string.format('item with id `%s` already exists', id))
  end

  local instance = definition.constructor(props)
  instance.__id = id
  self.items[id] = instance

  return true
end

---Remove an item
---@param id number
function Patch:removeItem(id)
  local item = self.items[id]
  Utils.callIfExists(item.__destroy, item)
  self.items[id] = nil
end

---Hot replace any existing items of a certain category and type.
---@param constructor Item
function Patch:updateItemInstances(constructor)
  -- As of now, hot item updates are only supported for modules.
  if constructor.__category ~= 'modules' then return end

  for id, item in pairs(self.items) do
    if
      item.__category == constructor.__category
      and item.__type == constructor.__type
    then
      ---@cast item Module
      local state = item:__saveState()
      item:__destroy()

      ---@type Module
      local newItem = constructor()
      newItem:__applyState(state)
      newItem.__id = id

      self.items[id] = newItem
    end
  end
end

---Add a new mapping.
---@param page number
---@param slot number
---@param id number
---@param prop string
function Patch:addMapping(page, slot, id, prop)
  self.mappings[page] = self.mappings[page] or {}
  local item = self.items[id]
  if not item then error(Log.messageItemNotFound(id)) end
  self.mappings[page][slot] = { item, prop }
end

---Remove a mapping.
---@param page number
---@param slot number
function Patch:removeMapping(page, slot)
  if not self.mappings[page] then return end
  self.mappings[page][slot] = nil
end

---Add a modulation.
---@param modulatorId number
---@param itemId number
---@param prop string
---@param amount number
function Patch:addModulation(modulatorId, itemId, prop, amount)
  local modulator = self.items[modulatorId] --[[@as Modulator]]
  if not modulator then error(Log.messageItemNotFound(modulatorId)) end

  local item = self.items[itemId]
  if not item then error(Log.messageItemNotFound(itemId)) end

  self.modulations[#self.modulations + 1] = { modulator, item, prop, amount }
end

function Patch:removeModulation(modulatorId, itemId, prop)
  for i, modulation in pairs(self.modulations) do
    if
      modulation[1].__id == modulatorId
      and modulation[2].__id == itemId
      and modulation[3] == prop
    then
      self.modulations[i] = nil
      return
    end
  end
end

---Get the modulation for the item's prop.
---@param itemId number
---@param name string
---@return table?
function Patch:getPropModulation(itemId, name)
  local item = self.items[itemId]
  if not item then error(Log.messageItemNotFound(itemId)) end

  for _, modulation in pairs(self.modulations) do
    if modulation[2] == item and modulation[3] == name then
      return modulation
    end
  end
end

---Update the value of the item's prop.
---@param itemId number
---@param name string
---@param value any
function Patch:updatePropValue(itemId, name, value, notifyApp)
  local item = self.items[itemId]
  if not item then error(Log.messageItemNotFound(itemId)) end

  local valueHasChanged = item.props.__values[name] ~= value
  if not valueHasChanged then return end

  local itemIsModulator = item.__category == 'modulators'
  local propIsModulated = self:getPropModulation(itemId, name)

  -- Modulators don't handle events and modules and will receive events for
  -- their modulated props whenever the modulator updates. So ein either case
  -- we can set the value directly and skip the events.
  if itemIsModulator or propIsModulated then
    item.props.__values[name] = value
  else
    ---@cast item Module
    self:setPropValueWithEvents(item, name, value, true)
  end

  if Utils.option(notifyApp, true) then
    Bridge.notify('/n/items/prop', item.__id, name, value)
  end
end

---Update the modulated value of the item's prop.
---@param item Item
---@param name string
---@param value any
function Patch:updateModulatedPropValue(item, name, value)
  local valueHasChanged = item.props.__modulatedValues[name] ~= value
  if not valueHasChanged then return end

  if item.__category == 'modules' then
    ---@cast item Module
    self:setPropValueWithEvents(item, name, value, true)
  else
    item.props.__modulatedValues[name] = value
  end
end

---Set the value of the item's prop and emit the corresponding events.
---@param module Module
---@param name string
---@param value any
function Patch:setPropValueWithEvents(module, name, value, isModulated)
  module:callEvent('prop:beforeChange', name, value)
  module:callEvent('prop[' .. name .. ']:beforeChange', value)

  if isModulated then
    module.props.__modulatedValues[name] = value
  else
    module.props.__values[name] = value
  end

  module:callEvent('prop:change', name, value)
  module:callEvent('prop[' .. name .. ']:change', value)
end

---Update and send the modulator values and update all modulated prop values.
---@param time number
function Patch:updateModulations(time, notifyApp)
  --? Right now, we only have a big items list. Maybe it would be more
  --? performant if we maintain a weak table of modulators only for quickly
  --? looping over them.
  --todo: early return of there are no modulators

  local modulatorValues = {}
  for id, modulator in pairs(self.items) do
    if modulator.__category == 'modulators' then
      ---@cast modulator Modulator
      modulatorValues[#modulatorValues + 1] = Utils.packBytes(
        id,
        Utils.mapValue(modulator:value(time), -1, 1, 0, 255)
      )
    end
  end

  if #modulatorValues == 0 then return end

  if Utils.option(notifyApp, true) then
    Bridge.notify('/n/modulators/values', unpack(modulatorValues))
  end

  for _, modulation in pairs(self.modulations) do
    local modulator, item, prop, amount = unpack(modulation)
    --Todo: remove, once LuaLS/lua-language-server/issues/1816 is resolved
    ---@cast modulator -string, -number, -Item

    if item and modulator then
      local component, options = unpack(item.__definition.props[prop])
      local definition = Miwos.definitions.props[component.__type]

      local baseValue = item.props.__values[prop]
      local modulationValue = modulator:value(time)
      local value =
        definition.modulateValue(baseValue, modulationValue, amount, options)

      self:updateModulatedPropValue(item, prop, value)
      -- TODO: notify bridge
    end
  end
end

---Remove all items, mappings and connections.
function Patch:clear()
  for id in pairs(self.items) do
    self:removeItem(id)
  end
  self.items = {}
  self.connections = {}
  self.mappings = {}
  -- TODO: clear PropsView
end

---Deserialize and add/make items, mappings, modulations and connections.
function Patch:deserialize(serialized)
  self:clear()

  for _, serializedModule in pairs(serialized.modules) do
    self:addItem(
      serializedModule.id,
      'modules',
      serializedModule.type,
      serializedModule.props
    )
  end

  for _, serializedModulator in pairs(serialized.modulators) do
    self:addItem(
      serializedModulator.id,
      'modulators',
      serializedModulator.type,
      serializedModulator.props
    )
  end

  self.connections = serialized.connections
  for _, connection in pairs(serialized.connections) do
    local fromId, fromIndex, toId, toIndex = unpack(connection)
    local item = self.items[fromId]
    if item.__category == 'modules' then
      ---@cast item Module
      item:__connect(fromIndex, toId, toIndex)
    else
      Log.warn(string.format("can't connect from %s", item.__category))
    end
  end

  self.modulations = {}
  for i, modulation in pairs(serialized.modulations) do
    -- Resolve the item and store it instead of it's id for quicker access.
    local modulatorId, itemId, prop, amount = unpack(modulation)

    local modulator = self.items[modulatorId] --[[@as Modulator]]
    if not modulator then error(Log.messageItemNotFound(modulatorId)) end

    local item = self.items[itemId]
    if not item then error(Log.messageItemNotFound(itemId)) end

    self.modulations[i] = { modulator, item, prop, amount }
  end

  self.mappings = {}
  for index, page in pairs(serialized.mappings or {}) do
    self.mappings[index] = page
    for slot, mapping in pairs(page) do
      -- Resolve the item and store it instead of it's id for quicker access.
      local itemId, prop = unpack(mapping)

      local item = self.items[itemId]
      if not item then error(Log.messageItemNotFound(itemId)) end

      page[slot] = { item, prop }
    end
  end
end

return Patch
