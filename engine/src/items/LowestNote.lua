---@class ModuleLowestNote : Module
local LowestNote = Miwos.defineModule('LowestNote', {
  shape = 'Filter',
  labels = { 'Low', 'Note' },
  inputs = { 'midi' },
  outputs = { 'midi' },
})

---@param a MidiNoteOn
---@param b MidiNoteOn
local function getLowerNote(a, b)
  return (b and b.note < a.note) and b or a
end

function LowestNote:setup()
  ---@type MidiNoteOn
  self.currentLowestNote = nil
  self.lowestNote = nil
  self.maxNoteInterval = 25 -- ms
  self.lastNoteTime = 0
  self.timer = nil
end

---@param note MidiNoteOn
LowestNote:event('input[1]:noteOn', function(self, note)
  ---@cast self ModuleLowestNote
  self.currentLowestNote = getLowerNote(note, self.currentLowestNote)

  Timer.cancel(self.timer)
  self.timer = Timer.delay(function()
    self:__finishNotes()
    self:output(1, self.currentLowestNote)
    self.lowestNote = self.currentLowestNote
    self.currentLowestNote = nil
  end, self.maxNoteInterval)
end)

---@param note MidiNoteOn
LowestNote:event('input[1]:noteOff', function(self, note)
  ---@cast self ModuleLowestNote

  local isLowestNote = self.lowestNote
    and Midi.getNoteId(self.lowestNote) == Midi.getNoteId(note)

  if isLowestNote then self:output(1, note) end
end)

return LowestNote
