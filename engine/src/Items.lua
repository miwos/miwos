Items = {
  ---@type table<string, ItemDefinition>
  definitions = {},

  ---@type table<number, boolean>
  activeOutputs = {},

  ---@type table<number, Item>
  instances = {},
}

function Items.init()
  Items.updateDefinitions()
end

---@param serialized ItemSerialzied[]
function Items.deserialize(serialized)
  for _, serializedItem in ipairs(serialized) do
    Items.add(serializedItem.id, serializedItem.type, serializedItem.props)
  end
end

---Get definitions from all items (without loading them permanently).
function Items.updateDefinitions()
  Items.definitions = {}
  local files = FileSystem.listFiles('lua/items')
  for _, baseName in ipairs(files) do
    local type = baseName:sub(1, -5) -- remove `.lua` extension
    local cachedItem = _LOADED['items.' .. type] --[[@as Item | nil]]
    local item = cachedItem or loadfile('lua/items/' .. baseName)()
    Items.definitions[item.__type] = item.__definition
  end
end

---@return ItemDefinitionSerialized
function Items.serializeDefinition(type)
  local definition = Items.definitions[type]
  if not definition then
    error(string.format('definition for item `%s` not found', type))
  end

  local props = {}
  for key, propDefinition in pairs(definition.props or {}) do
    local propType, options = unpack(propDefinition)
    props[key] = { propType, options }
  end

  local serialized = Utils.copyTable(definition)
  serialized.id = type
  serialized.props = props

  return serialized
end

function Items.serializeDefinitions()
  local serialized = {}
  for type in pairs(Items.definitions) do
    serialized[type] = Items.serializeDefinition(type)
  end
  return serialized
end

---@param id number
---@param type string
---@param props table<string, any>
---@return boolean
function Items.add(id, type, props)
  local definition = Items.definitions[type]
  if not definition then
    error(string.format('definition for item `%s` not found', type))
  end

  if Items.instances[id] then
    error(string.format('item with id `%s` already exists', id))
  end

  local constructor = require('items.' .. type)
  local instance = constructor(props)
  instance.__id = id
  Items.instances[id] = instance

  return true
end

---@param id number
function Items.remove(id)
  local item = Items.instances[id]
  Utils.callIfExists(item.__destroy, item)
  Items.instances[id] = nil
  -- TODO: unrequire the items Constructur if no other items are using it.
end

function Items.clear()
  for id in pairs(Items.instances) do
    Items.remove(id)
  end
  Miwos:emit('patch:change')
end

---Hot replace any existing items of a certain type.
---@param constructor Item
function Items.hotReplace(constructor)
  for id, item in pairs(Items.instances) do
    if item.__type == constructor.__type then
      local state = item:__saveState()
      item:__destroy()

      ---@type Item
      local newItem = constructor()
      newItem:__applyState(state)
      newItem.__id = id

      Items.instances[id] = newItem
    end
  end
end

---@param itemId number
---@param name string
---@param value any
---@param updateApp? boolean
function Items.updateProp(itemId, name, value, updateApp)
  local item = Items.instances[itemId]
  if not item then error(Log.messageItemNotFound(itemId)) end

  local valueHasChanged = item.props.__values[name] ~= value
  if not valueHasChanged then return end

  -- Items will receive events for their modulated props whenever the modulator
  -- updates, so we can set the value directly and skip the events.
  local propIsModulated = Modulations.getByItem(item, name)
  if propIsModulated then
    item.props.__values[name] = value
  else
    item:callEvent('prop:beforeChange', name, value)
    item:callEvent('prop[' .. name .. ']:beforeChange', value)
    item.props.__values[name] = value
    item:callEvent('prop:change', name, value)
    item:callEvent('prop[' .. name .. ']:change', value)
  end

  if Utils.option(updateApp, true) then
    Bridge.notify('/n/items/prop', item.__id, name, value)
  else
    Miwos:emit('prop:change', itemId, name, value)
  end
end

---@param item Item
---@param name string
---@param value any
function Items.updateModulatedProp(item, name, value)
  local valueHasChanged = item.props.__modulatedValues[name] ~= value
  if not valueHasChanged then return end

  item:callEvent('prop:beforeChange', name, value)
  item:callEvent('prop[' .. name .. ']:beforeChange', value)
  item.props.__modulatedValues[name] = value
  item:callEvent('prop:change', name, value)
  item:callEvent('prop[' .. name .. ']:change', value)

  -- Compared to `Items.updateProp()` we don't have to notify the app, because
  -- we send all modulated props together in one compact notification whenever
  -- the modulators are updated.
end

Items.sendActiveOutputs = Utils.throttle(function()
  local list = {}
  for activeOutput, isSustained in pairs(Items.activeOutputs) do
    -- `activeOutput` is packed with 2 bytes (itemId and outputIndex). Since
    -- we also have to send wether or not the output is sustained, we use the
    -- MSB of the index as a flag. The drawback is that the index can now only
    -- be in ther range of 1-127, which should be more than enough.
    list[#list + 1] = Utils.setBit(activeOutput, 16, isSustained)

    -- Reset non-sustained ouputs as soon es they are send.
    if not isSustained then Items.activeOutputs[activeOutput] = nil end
  end
  Bridge.notify('/n/items/active-outputs', unpack(list))
end, 50)
