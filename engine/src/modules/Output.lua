---@class ModuleOutput : Module
local Output = Miwos.defineModule('Output', {
  inputs = { 'midi' },
  label = false,
  clipContent = false,
  props = {
    device = Prop.Number({
      listed = false,
      value = 1,
      min = 1,
      max = 13,
      step = 1,
    }),
    cable = Prop.Number({
      listed = false,
      value = 1,
      min = 1,
      max = 16,
      step = 1,
    }),
  },
})

Output:event('prop:beforeChange', function(self)
  -- Finish the notes *before* either `device` or `cable` has changed, so we can
  -- send them to their correct location.
  self:__finishNotes()
end)

Output:event('input[1]', function(self, message)
  self:output(1, message)
end)

---Override `Module.__output()` to send the message directly via midi.
---@param message MidiMessage
function Output:__output(_, message)
  Midi:send(self.props.device, message, 1)
end

return Output
