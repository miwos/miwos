---@class ModuleVel: Module
local Vel = Miwos.defineModule('Vel', {
  shape = 'Transform',
  inputs = { 'midi' },
  outputs = { 'midi' },
  props = {
    vel = Prop.Number({ value = 100, min = 0, max = 127, step = 1 }),
  },
})

---@param note MidiNoteOn
Vel:event('input[1]:noteOn', function(self, note)
  ---@cast self ModuleVel
  self:output(1, Midi.NoteOn(note.note, self.props.vel, note.channel))
end)

---@param note MidiNoteOff
Vel:event('input[1]:noteOff', function(self, note)
  ---@cast self ModuleVel
  self:output(1, note)
end)

return Vel
