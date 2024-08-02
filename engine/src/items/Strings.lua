local tunings = {
  { label = 'Normal', pitches = { 40, 45, 50, 55, 59, 64 } },
  { label = 'DADGAD', pitches = { 38, 45, 50, 55, 57, 62 } },
  { label = 'FACGCE', pitches = { 41, 45, 48, 55, 60, 64 } },
  { label = 'Open A', pitches = { 40, 45, 49, 52, 57, 64 } },
  { label = 'Open B', pitches = { 47, 42, 47, 54, 59, 63 } },
  { label = 'Open C', pitches = { 48, 43, 48, 55, 60, 64 } },
  { label = 'Open D', pitches = { 38, 45, 50, 54, 57, 62 } },
  { label = 'Open E', pitches = { 40, 47, 52, 56, 59, 64 } },
  { label = 'Open F', pitches = { 41, 45, 48, 53, 60, 65 } },
  { label = 'Open G', pitches = { 38, 43, 50, 55, 59, 62 } },
}

local tuningLabels = {}
for index, value in ipairs(tunings) do
  tuningLabels[index] = value.label
end

---@class ModuleStringProps
---@field note number
---@field tunings {label: string, pitches: number[]}[]
---@field tuning number
---@field chord table<number, number>
---@field pattern table<number, number | number[]>
---@field step number
---@field playPause boolean

---@class ModuleStrings : Module
---@field props ModuleStringProps
local Strings = Miwos.defineModule('Strings', {
  shape = 'Strings',
  inputs = { 'midi' },
  outputs = { 'midi' },
  props = {
    note = Prop.Number({ value = 6, min = 1, max = 96, step = 1 }),
    tunings = Prop.Value({ value = tunings }),
    tuning = Prop.Select({
      value = 1, -- Normal tuning
      options = tuningLabels,
    }),
    chord = Prop.Value({ value = { [2] = 3 } }),
    pattern = Prop.Value({ value = { { 1, 3 }, { 2, 4 }, { 3, 5 }, { 4, 6 } } }),
    -- pattern = Prop.Value({ value = { 1, 2, 3, 4, 5, 6 } }),
    step = Prop.Value({ value = 0 }),
    playPause = Prop.Button({ toggle = true, value = false }),
  },
})

function Strings:setup()
  self.lastNoteInTime = 0
  self.maxNoteInterval = 100 -- ms

  self.noteInputTimer = nil
  self.scheduleTimer = nil
  self.scheduleInterval = 25 --ms
  self.nextNoteTime = Timer.ticks()
  self.scheduleAheadTime = 4 --ticks

  self.notes = {}
  self.chords = {}
end

function Strings:schedule()
  self.scheduleTimer = Timer.delay(function()
    local stringPitches = tunings[self.props.tuning].pitches
    local ticks = Timer.ticks()
    while self.nextNoteTime < ticks + self.scheduleAheadTime do
      self.props.step = self.props.step + 1
      if self.props.step > #self.props.pattern then self.props.step = 1 end

      local strings = Utils.asTable(self.props.pattern[self.props.step])

      for _, string in ipairs(strings) do
        local fret = (self.props.chord and self.props.chord[string]) or 0
        local pitch = stringPitches[string] + fret

        local noteOn = Midi.NoteOn(pitch, 127, 1)
        self:output(1, noteOn:schedule(self.nextNoteTime, true))

        --? Maybe find a more accurate timing method for the note off.
        Timer.delay(function()
          local noteOff = Midi.NoteOff(pitch, 0, 1)
          self:output(1, noteOff)
        end, 200)
      end

      self.nextNoteTime = self.nextNoteTime + self.props.note
    end

    self:schedule()
  end, self.scheduleInterval)
end

function Strings:destroy()
  Timer.cancel(self.noteInputTimer)
  Timer.cancel(self.scheduleTimer)
end

Strings:event('prop[playPause]:change', function(self, value)
  ---@cast self ModuleStrings
  if value then
    self.nextNoteTime = Timer.ticks()
    self:schedule()
  else
    Timer.cancel(self.scheduleTimer)
  end
end)

Strings:event('input[1]:noteOn', function(self, note)
  ---@cast self ModuleStrings
  ---@cast note MidiNoteOn

  local time = Timer.millis()
  if time - self.lastNoteInTime > self.maxNoteInterval then self.notes = {} end

  self.notes[#self.notes + 1] = note.note
  self.lastNoteInTime = time

  Timer.cancel(self.noteInputTimer)
  self.noteInputTimer = Timer.delay(function()
    self.chords = self:findFrettedChords(self.notes)
    self.props.chord = self.chords[1]
  end, self.maxNoteInterval)
end)

---@param notes table<number>
---@return table
function Strings:findFrettedChords(notes)
  local stringPitches = tunings[self.props.tuning].pitches

  -- All possible locations of each note in the chord, stored as a table
  -- of { string = fret }.
  local notePositions = {}
  for _, notePitch in ipairs(notes) do
    local positions = {}
    local hasPosition = false
    for string, stringPitch in ipairs(stringPitches) do
      local fret = notePitch - stringPitch
      if fret >= 0 and fret <= 12 then
        positions[string] = fret
        hasPosition = true
      end
    end
    if hasPosition then notePositions[#notePositions + 1] = positions end
  end

  -- `frettedChords` will hold the result of `buildFrettedChords()`.
  local frettedChords = {}
  self:buildFrettedChords(notePositions, 1, {}, frettedChords)

  -- Prefer chords that would be easy to pick on a stringed instrument (small
  -- fret span bettwen all notes).
  table.sort(frettedChords, function(a, b)
    return self:getFretSpan(a) < self:getFretSpan(b)
  end)

  return frettedChords
end

function Strings:buildFrettedChords(
  notePositions,
  index,
  currentChord,
  allChords
)
  -- The chord is finished, as we included all notes.
  if index > #notePositions then
    allChords[#allChords + 1] = currentChord
    return
  end

  -- Each note could be played on multiple strings, therefore we have to
  -- recursively walk each possible note position.
  for string, fret in pairs(notePositions[index]) do
    -- On a stringed instrument we can only pick one note per string.
    if currentChord[string] == nil then
      local chordCopy = Utils.copyTable(currentChord)
      chordCopy[string] = fret
      self:buildFrettedChords(notePositions, index + 1, chordCopy, allChords)
    end
  end
end

function Strings:getFretSpan(frettedNotes)
  local lowest, highest = math.huge, 0
  for _, fret in pairs(frettedNotes) do
    if fret > 0 then
      lowest = math.min(lowest, fret)
      highest = math.max(highest, fret)
    end
  end
  return highest - lowest
end

return Strings
