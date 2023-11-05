---@class ControlChange : Module

local ControlChange = Miwos.defineModule('ControlChange', {
  outputs = { 'midi' },
  shape = 'Input',
  showLabel = false,
  props = {
    control = Prop.Number({ value = 0, min = 0, max = 127, step = 1 }),
    value = Prop.Number({ value = 0, min = 0, max = 127, step = 1 }),
    channel = Prop.Number({ value = 1, min = 1, max = 16, step = 1 }),
  },
})

ControlChange:event('prop[value]:change', function(self, value)
  ---@cast self ControlChange
  local message =
    Midi.ControlChange(self.props.control, value, self.props.channel)

  self:output(1, message)
end)

return ControlChange
