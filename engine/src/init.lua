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
require('Items')
require('Connections')
require('Mappings')
require('Modulations')
require('Project')

local PropsView = require('ui.views.PropsView')
local MenuView = require('ui.views.MenuView')

-- Project
Bridge.addMethod('/r/project/open', function(name)
  Project.open(name, false)
end)

-- Items
Bridge.addMethod('/r/items/add', Items.add)
Bridge.addMethod('/r/items/remove', Items.remove)
Bridge.addMethod('/r/items/prop', function(itemId, name, value)
  Items.updateProp(itemId, name, value, false)
end)
Bridge.addMethod('/r/items/definition', function(type)
  Items.updateDefinitions()
  return Utils.serialize(Items.serializeDefinition(type))
end)
Bridge.addMethod('/r/items/definitions', function()
  Items.updateDefinitions()
  return Utils.serialize(Items.serializeDefinitions())
end)

-- Connections
Bridge.addMethod('/r/connections/add', Connections.add)
Bridge.addMethod('/r/connections/remove', Connections.remove)

-- Mappings
Bridge.addMethod('/r/mappings/add', Mappings.add)
Bridge.addMethod('/r/mappings/remove', Mappings.remove)

-- Modulations
Bridge.addMethod('/r/modulations/add', Modulations.add)
Bridge.addMethod('/r/modulations/remove', Modulations.remove)
Bridge.addMethod('/r/modulations/amount', Modulations.updateAmount)

--TODO: rename channel to `midi`
-- Transport
Bridge.addMethod('/r/transport/start', Midi.start)
Bridge.addMethod('/r/transport/stop', Midi.stop)
Bridge.addMethod('/r/transport/tempo', Midi.setTempo)
Bridge.addMethod('/r/transport/info', function()
  return Utils.serialize({
    tempo = Midi.getTempo(),
    isPlaying = Midi.getIsPlaying(),
  })
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

-- Init
collectgarbage('setpause', 50)
collectgarbage('setstepmul', 500)

Items.init()

local function logUsedMemory()
  Bridge.notify('/n/info/memory', collectgarbage('count'))
  Timer.delay(logUsedMemory, 1000)
end
logUsedMemory()
