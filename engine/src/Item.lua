local class = require('class')
local createProps = require('props')

---@class Item : Class
---@field __type string
---@field __id number
---@field __definition ItemDefinition
---@field __serialize fun(self: Item): ItemSerialzied
---@field __saveState function
---@field __applyState fun(self: Item, state: table<string, any>)
---@field __destroy function | nil
---@field __events table<string, function>
---@field props table<string, any>
---@field setup function | nil
---@field destroy function | nil
local Item = class()
Item.__hmrKeep = {}

function Item:constructor(props)
  self.__inputs = {}
  self.__outputs = {}
  self.__activeNotes = {}
  self.props = createProps(
    self,
    Utils.getPropsWithDefaults(self.__definition.props, props or {})
  )

  Utils.callIfExists(self.setup, self)
end

function Item:event(name, handler)
  self.__events[name] = handler
end

function Item:callEvent(name, ...)
  Utils.callIfExists(self.__events[name], self, ...)
end

---@param outputIndex number
---@param itemId number
---@param inputIndex number
function Item:__connect(outputIndex, itemId, inputIndex)
  self.__outputs[outputIndex] = self.__outputs[outputIndex] or {}
  table.insert(self.__outputs[outputIndex], { itemId, inputIndex })
end

---@param outputIndex number
---@param itemId number
---@param inputIndex number
function Item:__disconnect(outputIndex, itemId, inputIndex)
  for connectionIndex, connection in pairs(self.__outputs[outputIndex] or {}) do
    if connection[1] == itemId and connection[2] == inputIndex then
      self.__outputs[outputIndex][connectionIndex] = nil
      return
    end
  end
end

---@param index number
---@param message MidiMessage|nil
function Item:output(index, message)
  local signal = message and 'midi' or 'trigger'
  local isNoteOn = message and message:is(Midi.Type.NoteOn)
  local isNoteOff = message and message:is(Midi.Type.NoteOff)

  if isNoteOn or isNoteOff then
    ---@cast message MidiNoteOn | MidiNoteOff
    local activeNoteKey = Utils.packBytes(index, message.note, message.channel)
    self.__activeNotes[activeNoteKey] = isNoteOn or nil
  end

  -- We distinguish between two types of active outputs:
  -- 1. a simple midi message or trigger: it will be added to
  --    `Items.activeOutputs` and removed automatically as soon as the app has
  --    been notified.
  -- 2. a sustained output (a midi note): it will also be added to
  --    `Items.activeOutputs` but not removed automatically, we will remove it
  --    manually as soon as we receive the corresponding note off message.
  local isSustained = isNoteOn
  local activeOutputKey = Utils.packBytes(self.__id, index)
  if isNoteOff then
    -- If there are no active notes (next is nil) the output itself isn't active
    -- anymore.
    Items.activeOutputs[activeOutputKey] = next(self.__activeNotes)
  else
    Items.activeOutputs[activeOutputKey] = isSustained
  end

  self:__output(index, message)
  Items.sendActiveOutputs()
end

---@param index number
---@param message MidiMessage
---@param time number
---@param useTicks? boolean
function Item:scheduleOutput(index, message, time, useTicks)
  message.__scheduleAt = { time, useTicks }
  self:output(index, message)
end

function Item:__output(index, message)
  if self.__outputs[index] then
    for _, input in pairs(self.__outputs[index]) do
      local inputId, inputIndex = unpack(input)
      local item = Items.instances[inputId]
      if not item then error(Log.messageItemNotFound(inputId)) end

      local name = message and Midi.TypeName[message.type] or 'trigger'
      local numberedInput = 'input[' .. inputIndex .. ']'

      item:callEvent('input', inputIndex, message)
      item:callEvent('input:' .. name, inputIndex, message)
      item:callEvent(numberedInput, message)
      item:callEvent(numberedInput .. ':' .. name, message)
    end
  end
end

---@param output? number
function Item:__finishNotes(output)
  for activeNote in pairs(self.__activeNotes) do
    local index, note, channel = Utils.unpackBytes(activeNote)
    if not output or index == output then
      self:__output(index, Midi.NoteOff(note, 0, channel))
    end
  end
  self.__activeNotes = {}
end

function Item:__saveState()
  local state = { props = self.props, __outputs = self.__outputs }

  for _, key in pairs(self.__hmrKeep) do
    state[key] = self[key]
  end

  return state
end

function Item:__applyState(state)
  -- Merge props instead of assigning them, incase a new prop was added that
  -- wasn't part of the last state.
  for key, value in pairs(state.props) do
    self.props[key] = value
  end

  self.__outputs = state.__outputs
  for _, key in pairs(self.__hmrKeep) do
    if state[key] ~= nil then self[key] = state[key] end
  end
end

function Item:__destroy()
  self:__finishNotes()
  Utils.callIfExists(self.destroy, self)
end

function Item.__hmrAccept(module)
  Items.hotReplace(module)
end

function Item.__hmrDecline(module)
  -- We only want to hot replace actual items, not the (abstract) item base
  -- class itself. Only items registered with `Miwos.defineModule()` or
  -- `Miwos.defineModulator()`have a `__type`.
  return not module.__type
end

return Item
