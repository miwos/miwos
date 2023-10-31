local class = require('class')
local createProps = require('props')

---@class Module : Item
---@field __definition ModuleDefinition
---@field __events table<string, function>
---@field setup function | nil
---@field destroy function | nil
local Module = class()
Module.__hmrKeep = {}
Module.__category = 'modules'

function Module:constructor(props)
  self.__inputs = {}
  self.__outputs = {}
  self.__activeNotes = {}
  self.props = createProps(
    self,
    Utils.getPropsWithDefaults(self.__definition.props, props or {})
  )

  Utils.callIfExists(self.setup, self)
end

function Module:event(name, handler)
  self.__events[name] = handler
end

function Module:callEvent(name, ...)
  Utils.callIfExists(self.__events[name], self, ...)
end

---@param outputIndex number
---@param moduleId number
---@param inputIndex number
function Module:__connect(outputIndex, moduleId, inputIndex)
  self.__outputs[outputIndex] = self.__outputs[outputIndex] or {}
  table.insert(self.__outputs[outputIndex], { moduleId, inputIndex })
end

---@param outputIndex number
---@param moduleId number
---@param inputIndex number
function Module:__disconnect(outputIndex, moduleId, inputIndex)
  for connectionIndex, connection in pairs(self.__outputs[outputIndex] or {}) do
    if connection[1] == moduleId and connection[2] == inputIndex then
      self.__outputs[outputIndex][connectionIndex] = nil
      return
    end
  end
end

---@param index number
---@param message MidiMessage|nil
function Module:output(index, message)
  local signal = message and 'midi' or 'trigger'
  local isNoteOn = message and message:is(Midi.NoteOn)
  local isNoteOff = message and message:is(Midi.NoteOff)

  if isNoteOn or isNoteOff then
    ---@cast message MidiNoteOn | MidiNoteOff
    local activeNoteKey = Utils.packBytes(index, message.note, message.channel)
    self.__activeNotes[activeNoteKey] = isNoteOn or nil
  end

  -- We distinguish between two types of active outputs:
  -- 1. a simple midi message or trigger: it will be added to
  --    `Miwos.activeOutputs` and removed automatically as soon as the app has
  --    has been notified.
  -- 2. a sustained output (a midi note): it will also be added to
  --    `Miwos.activeOutputs` but not removed automatically, we will remove it
  --     manually as soon as we receive the corresponding note off message.
  local isSustained = isNoteOn
  local activeOutputKey = Utils.packBytes(self.__id, index)
  if isNoteOff then
    Miwos.activeOutputs[activeOutputKey] = nil
  else
    Miwos.activeOutputs[activeOutputKey] = isSustained
  end

  self:__output(index, message)
  Miwos.sendActiveOutputs()
end

---@param index number
---@param message MidiMessage
---@param time number
---@param useTicks? boolean
function Module:scheduleOutput(index, message, time, useTicks)
  message.__scheduleAt = { time, useTicks }
  self:output(index, message)
end

function Module:__output(index, message)
  if self.__outputs[index] then
    for _, input in pairs(self.__outputs[index]) do
      local inputId, inputIndex = unpack(input)
      local item = Miwos.patch and Miwos.patch.items[inputId]
      if not item then error(Log.messageItemNotFound(inputId)) end

      if item and item.__category == 'modules' then
        ---@cast item Module
        local name = message and message.name or 'trigger'
        local numberedInput = 'input[' .. inputIndex .. ']'

        item:callEvent('input', inputIndex, message)
        item:callEvent('input:' .. name, inputIndex, message)
        item:callEvent(numberedInput, message)
        item:callEvent(numberedInput .. ':' .. name, message)
      end
    end
  end
end

---@param output? number
function Module:__finishNotes(output)
  for activeNote in pairs(self.__activeNotes) do
    local index, note, channel = Utils.unpackBytes(activeNote)
    if not output or index == output then
      self:__output(index, Midi.NoteOff(note, 0, channel))
    end
  end
  self.__activeNotes = {}
end

function Module:__saveState()
  local state = { props = self.props, __outputs = self.__outputs }

  for _, key in pairs(self.__hmrKeep) do
    state[key] = self[key]
  end

  return state
end

function Module:__applyState(state)
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

function Module:__destroy()
  self:__finishNotes()
  Utils.callIfExists(self.destroy, self)
end

function Module.__hmrAccept(module)
  if Miwos.patch then Miwos.patch:updateItemInstances(module) end
end

function Module.__hmrDecline(module)
  -- We only want to hot replace actual modules, not the (abstract) module base
  -- class itself. Only modules registered with `Miwos.defineModule()` have a
  -- `__type`.
  return not module.__type
end

return Module
