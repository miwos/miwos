---@class ModulePitch : Module
local Pitch = Miwos.defineModule('Pitch', {
  shape = 'Transform',
  inputs = { 'midi' },
  outputs = { 'midi' },
  props = {
    pitch = Prop.Number({ value = 0, min = -24, max = 24, step = 1 }),
  },
})

function Pitch:setup()
  -- If a user plays, e.g. a note 60 with a pitch of +5, the actual note value
  -- is 65. We have to keep track of it and use it for the note off event even
  -- if the pitch prop has changed in the meantime.
  self.usedNotes = {}
end

---@param message MidiNoteOn
Pitch:event('input[1]:noteOn', function(self, message)
  ---@cast self ModulePitch
  local pitchedNote = message.note + self.props.pitch
  self.usedNotes[Midi.getNoteId(message)] = pitchedNote
  self:output(1, Midi.NoteOn(pitchedNote, message.velocity, message.channel))
end)

---@param message MidiNoteOff
Pitch:event('input[1]:noteOff', function(self, message)
  ---@cast self ModulePitch
  local noteId = Midi.getNoteId(message)
  local pitchedNote = self.usedNotes[noteId]

  -- Sometimes `pitchedNote` is already deleted. Not sure why this happens.
  if pitchedNote then
    self.usedNotes[noteId] = nil
    self:output(1, Midi.NoteOff(pitchedNote, message.velocity, message.channel))
  end
end)

return Pitch
