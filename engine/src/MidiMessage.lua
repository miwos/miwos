local class = require('class')

local typeKeysLookup = {
  [Midi.Type.NoteOn] = { 'note', 'velocity' },
  [Midi.Type.NoteOff] = { 'note', 'velocity' },
  [Midi.Type.ControlChange] = { 'control', 'value' },
}

---@class MidiMessage : Class
local MidiMessage = class()

---@param type MidiType
---@param data1 number
---@param data2 number
---@param channel number
function MidiMessage:constructor(type, data1, data2, channel)
  self.type = type
  self.channel = channel

  self.keys = typeKeysLookup[type] or { 'data1', 'data2' }
  self[self.keys[1]] = data1
  self[self.keys[2]] = data2
end

function MidiMessage:data()
  return self[self.keys[1]], self[self.keys[2]]
end

function MidiMessage:toBytes()
  local data1, data2 = self:data()
  return Utils.packBytes(self.type, data1, data2, self.channel)
end

---@param bytes number
---@returns MidiMessage
function MidiMessage:fromBytes(bytes)
  local type, data1, data2, channel = Utils.unpackBytes(bytes)
  return MidiMessage(type, data1, data2, channel)
end

function MidiMessage:is(messageFactory)
  local name = Midi.TypeName[self.type]
  local factory = Midi[name]
  return factory == messageFactory
end

---@class MidiNoteOn : MidiMessage
---@field note number
---@field velocity number

---@class MidiNoteOff : MidiMessage
---@field note number
---@field velocity number

---@class MidiControlChange : MidiMessage
---@field contorl number
---@field value number

return MidiMessage
