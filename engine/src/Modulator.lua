local class = require('class')
local createProps = require('props')

---@class Modulator : Item
---@field __definition ModulatorDefinition
---@field props table
---@field value fun(self: Modulator, time: number): number
---@field setup function | nil
---@field destroy function | nil
local Modulator = class()
Modulator.__category = 'modulators'

function Modulator:constructor(props)
  self.__inputs = {}
  self.__outputs = {}
  self.__activeNotes = {}
  self.props = createProps(
    self,
    Utils.getPropsWithDefaults(self.__definition.props, props or {})
  )

  Utils.callIfExists(self.setup, self)
end

return Modulator
