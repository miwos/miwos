---@class Midi : EventEmitter
---@field private __send fun(index: number, type: number, data1: number, data2: number, channel: number, cable: number)
---@field __start fun()
---@field __stop fun()
---@field getIsPlaying fun(): boolean
---@field setTempo fun(bpm: number)
---@field getTempo fun(): number
---@field NoteOn fun(note, velocity, channel): MidiNoteOn
---@field NoteOff fun(note, velocity, channel): MidiNoteOff
---@field ControlChange fun(note, velocity, channel): MidiControlChange
Midi = _G.Midi or {}

Utils.mixin(Midi, require('EventEmitter'))
Midi.__events = {}

---@enum MidiType
Midi.Type = {
  NoteOn = 0x90,
  NoteOff = 0x80,
  ControlChange = 0xB0,
}

Midi.TypeName = {
  [Midi.Type.NoteOn] = 'noteOn',
  [Midi.Type.NoteOff] = 'noteOff',
  [Midi.Type.ControlChange] = 'controlChange',
}

-- `MidiMessage` depends on `Midi.Type`, so we have to require it after it
-- is initialized.
Midi.Message = require('MidiMessage')

-- Shorthand MidiMessage factories
for _, type in pairs(Midi.Type) do
  Midi[Utils.capitalize(Midi.TypeName[type])] = function(...)
    return Midi.Message(type, ...)
  end
end

---@param index number
---@param type number
---@param data1 number
---@param data2 number
---@param channel number
---@param cable number
function Midi.handleInput(index, type, data1, data2, channel, cable)
  local message = Midi.Message(type, data1, data2, channel)
  Midi:emit('input', index, message, cable)
end

function Midi.handleClock(tick)
  -- Midi.send(1, Midi.NoteOn(62, 127, 1), 1)
end

---@param index number
---@param message MidiMessage
---@param cable number
function Midi.send(index, message, cable)
  local data1, data2 = message:data()
  Midi.__send(index, message.type, data1, data2, message.channel, cable)
end

function Midi.start()
  Midi.__start()
  for _, item in pairs(Items.instances) do
    item:callEvent('clock:start')
  end
end

function Midi.stop()
  Timer.clearScheduledMidi()
  Midi.__stop()
  for _, item in pairs(Items.instances) do
    item:callEvent('clock:stop')
    item:__finishNotes()
  end
end

---@param note MidiNoteOn | MidiNoteOff
---@return number
function Midi.getNoteId(note)
  return Utils.packBytes(note.note, note.channel)
end

---@param id number
---@return number, number
function Midi.parseNoteId(id)
  local note, channel = Utils.unpackBytes(id)
  return note, channel
end
