require('Utils')
require('Bridge')
require('Buttons')
require('Encoders')
require('Hmr')
require('Leds')
require('Log')
require('Midi')
require('Miwos')
require('Prop')
require('Timer')

require('modules.Input')
require('modules.Output')
require('modules.Chord')
require('modules.Delay')
require('modules.Strings')
require('modules.ChordSplit')
require('modules.ControlChange')
require('modules.Clip')

require('modulators.Lfo')

local PropsView = require('ui.views.PropsView')
local MenuView = require('ui.views.MenuView')

-- Items
Bridge.addMethod('/e/items/add', function(...)
  return Miwos.patch:addItem(...)
end)

Bridge.addMethod('/e/items/remove', function(...)
  return Miwos.patch:removeItem(...)
end)

Bridge.addMethod('/e/items/prop', function(itemId, name, value)
  Miwos.patch:updatePropValue(itemId, name, value, false)
  Miwos:emit('prop:change', itemId, name, value)
end)

Bridge.addMethod('/e/items/definition', function(category, type)
  local cachedItem = _LOADED[category .. '.' .. type]
  local item = cachedItem or loadfile('lua/' .. category .. '/' .. type)()
  return Utils.serialize(item:serializeDefinition())
end)

Bridge.addMethod('/e/items/definitions', function(category)
  local definitions = {}
  local files = FileSystem.listFiles('lua/' .. category)
  for _, baseName in pairs(files) do
    ---@type Module
    local cachedItem = _LOADED[category .. '.' .. baseName]
    local item = cachedItem or loadfile('lua/' .. category .. '/' .. baseName)()
    definitions[#definitions + 1] = item:serializeDefinition()
  end
  return Utils.serialize(definitions)
end)

-- Connections
Bridge.addMethod(
  '/e/connections/add',
  function(fromId, outputIndex, toId, inputIndex)
    local fromModule = Miwos.patch:getItem(fromId) --[[@as Module]]
    fromModule:__connect(outputIndex, toId, inputIndex)
  end
)

Bridge.addMethod(
  '/e/connections/remove',
  function(fromId, outputIndex, toId, inputIndex)
    local fromModule = Miwos.patch:getItem(fromId) --[[@as Module]]
    fromModule:__disconnect(outputIndex, toId, inputIndex)
  end
)

-- Patch
Bridge.addMethod('/e/patch/clear', function()
  Miwos.patch:clear()
  Miwos:emit('patch:change')
end)

-- Mappings

Bridge.addMethod('/e/mappings/add', function(page, slot, id, prop)
  Miwos.patch:addMapping(page, slot, id, prop)
  Miwos:emit('patch:change')
end)

Bridge.addMethod('/e/mappings/remove', function(page, slot)
  Miwos.patch:removeMapping(page, slot)
  Miwos:emit('patch:change')
end)

-- Modulations
Bridge.addMethod(
  '/e/modulations/add',
  function(modulatorId, itemId, prop, amount)
    Miwos.patch:addModulation(modulatorId, itemId, prop, amount)
    Miwos:emit('patch:change')
  end
)

Bridge.addMethod('/e/modulations/remove', function(modulatorId, itemId, prop)
  Miwos.patch:removeModulation(modulatorId, itemId, prop)
  Miwos:emit('patch:change')
end)

Bridge.addMethod(
  '/e/modulations/amount',
  function(modulatorId, moduleId, prop, amount)
    for _, modulation in pairs(Miwos.patch.modulations) do
      if
        modulation[1] == modulatorId
        and modulation[2] == moduleId
        and modulation[3] == prop
      then
        modulation[4] = amount
        return
      end
    end
  end
)

-- Project
Bridge.addMethod('/e/project/load', function(name)
  Miwos.loadProject(name, false)
  Miwos.switchView(PropsView({ patch = Miwos.patch }))
end)

local menuOpened = false
Buttons:on('click', function(index)
  if index == 10 then
    menuOpened = not menuOpened
    if menuOpened then
      Miwos.switchView(MenuView())
    else
      Miwos.switchView(PropsView({ patch = Miwos.patch }))
    end
  end
end)

Miwos.loadSettings()
Miwos.loadProject('test')
Miwos.switchView(PropsView({ patch = Miwos.patch }))

Midi.start()

-- Log.info(Utils.getUsedMemory())

-- require('Test')
-- Test.runFile('lua/tests/Midi-test.lua')

-- TODO: Find good GC settings
-- collectgarbage('setpause', 100)
-- collectgarbage('setstepmul', 400)
collectgarbage('setpause', 50)
collectgarbage('setstepmul', 500)

local function logUsedMemory()
  Bridge.notify('/e/memory', collectgarbage('count'))
  Timer.delay(logUsedMemory, 1000)
end

logUsedMemory()
