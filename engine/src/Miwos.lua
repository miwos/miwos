local class = require('class')
local Item = require('Item')
local Component = require('Component')

---@class Miwos : EventEmitter
---@field view Component | nil
Miwos = _G.Miwos or {}

Utils.mixin(Miwos, require('EventEmitter'))
Miwos.__events = {}

Miwos.definitions = {
  ---@type table<string, PropDefinition>
  props = {},
}

---@param name string
---@param definition ModuleDefinition
---@return Module
function Miwos.defineModule(name, definition)
  definition.category = 'modules'

  local module = class(Item) --[[@as Module]]
  module.__type = name
  module.__events = {}
  module.__definition = definition

  Items.definitions[name] = definition
  _G.__propIndex = nil
  return module
end

---@param name string
---@param definition ModulatorDefinition
---@return Modulator
function Miwos.defineModulator(name, definition)
  definition.category = 'modulators'

  local modulator = class(Item) --[[@as Modulator]]
  modulator.__type = name
  modulator.__events = {}
  modulator.__definition = definition

  Items.definitions[name] = definition
  _G.__propIndex = nil
  return modulator
end

---@param name string
---@param definition PropDefinition
function Miwos.defineProp(name, definition)
  Miwos.definitions.props[name] = definition
end

---@param type string
---@return Component
function Miwos.defineComponent(type)
  local component = class(Component) --[=[@as Component]=]
  component.__type = type
  component.__events = {}
  return component
end

---@param view Component
function Miwos.switchView(view)
  local prevView = Miwos.view
  if prevView then prevView:__unmount() end
  view:__mount()
  Miwos.view = view
end

function Miwos.loadSettings()
  local file = 'lua/settings.lua'
  local data = FileSystem.fileExists(file) and loadfile(file)() or {}
  Miwos.settings = data
end

function Miwos.saveSettings()
  local file = 'lua/settings.lua'
  local content = 'return ' .. Utils.serialize(Miwos.settings, true)
  local result = FileSystem.writeFile(file, content)
end
