---@class ModulePitchWith : Module
local PitchWith = Miwos.defineModule('PitchWith', {
  shape = 'TransformWith',
  inputs = { 'midi', 'midi' },
  outputs = { 'midi' },
  props = {
    root = Prop.Number({ value = 60, min = 22, max = 107, step = 1 }),
  },
})

function PitchWith:setup()
  -- If a user plays, e.g. a note 60 with a pitch of +5, the actual note value
  -- is 65. We have to keep track of it and use it for the note off event even
  -- if the pitch prop has changed in the meantime.
  self.usedNotes = {}
  self.pitch = 0
end

---@param message MidiNoteOn
PitchWith:event('input[1]:noteOn', function(self, message)
  ---@cast self ModulePitchWith
  local pitchedNote = message.note + self.pitch
  self.usedNotes[Midi.getNoteId(message)] = pitchedNote
  self:output(1, Midi.NoteOn(pitchedNote, message.velocity, message.channel))
end)

---@param message MidiNoteOff
PitchWith:event('input[1]:noteOff', function(self, message)
  ---@cast self ModulePitchWith
  local noteId = Midi.getNoteId(message)
  local pitchedNote = self.usedNotes[noteId]

  -- Sometimes `pitchedNote` is already deleted. Not sure why this happens.
  if pitchedNote then
    self.usedNotes[noteId] = nil
    self:output(1, Midi.NoteOff(pitchedNote, message.velocity, message.channel))
  end
end)

---@param message MidiNoteOn
PitchWith:event('input[2]:noteOn', function(self, message)
  ---@cast self ModulePitchWith
  self.pitch = message.note - self.props.root
end)

return PitchWith
