local class = require('class')
local Module = require('Module')
local Modulator = require('Modulator')
local Patch = require('Patch')
local Component = require('Component')

---@class Miwos : EventEmitter
---@field patch Patch | nil
---@field view Component | nil
Miwos = _G.Miwos or {}

Utils.mixin(Miwos, require('EventEmitter'))
Miwos.__events = {}

Miwos.definitions = {
  ---@type table<string, PropDefinition>
  props = {},
  ---@type table<string, ModuleDefinition>
  modules = {},
  ---@type table<string, ModulatorDefinition>
  modulators = {},
}

---@type table<number, boolean>
Miwos.activeOutputs = {}

---@param name string
---@param definition ModuleDefinition
---@return Module
function Miwos.defineModule(name, definition)
  local module = class(Module) --[=[@as Module]=]
  module.__type = name
  module.__events = {}
  module.__definition = definition
  definition.constructor = module
  Miwos.definitions.modules[name] = definition
  _G.__propIndex = nil
  return module
end

---@param name string
---@param definition ModulatorDefinition
---@return Modulator
function Miwos.defineModulator(name, definition)
  local modulator = class(Modulator) --[=[@as Modulator]=]
  modulator.__definition = definition
  definition.constructor = modulator
  Miwos.definitions.modulators[name] = definition
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

---@param name string
---@param updateApp? boolean
function Miwos.loadProject(name, updateApp)
  local data = loadfile('lua/projects/' .. name .. '/part-1.lua')()
  Miwos.patch = Patch()
  Miwos.patch:deserialize(data)
  Miwos:emit('patch:change', Miwos.patch)

  if Utils.option(updateApp, true) then
    Bridge.notify('/e/project/open', name)
  end
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

Miwos.sendActiveOutputs = Utils.throttle(function()
  local list = {}
  for activeOutput, isSustained in pairs(Miwos.activeOutputs) do
    -- `activeOutput` is packed with 2 bytes (moduleId and outputIndex). Since
    -- we also have to send wether or not the output is sustained, we use the
    -- MSB of the index as a flag. The drawbag is that the index can now only be
    -- in ther range of 1-127, which should be more than enough.
    list[#list + 1] = Utils.setBit(activeOutput, 16, isSustained)

    -- Reset non-sustained ouputs as soon es they are send.
    if not isSustained then Miwos.activeOutputs[activeOutput] = nil end
  end
  Bridge.notify('/e/modules/active-outputs', unpack(list))
end, 50)
