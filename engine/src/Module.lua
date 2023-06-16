local class = require('class')
local Utils = require('utils')

---@class Module : Class
---@field __type string
---@field __id number set in `Patch:addModule()`
---@field __definition ModuleDefinition
---@field __events table<string, function>
---@field setup function | nil
---@field destroy function | nil
local Module = class()
Module.__hmrKeep = {}

function Module:constructor(props)
  self.__inputs = {}
  self.__outputs = {}
  self.__activeNotes = {}

  self.__propValues =
    Utils.getPropsWithDefaults(self.__definition.props, props or {})
  self.__propValuesModulated = {}
  self.props = setmetatable({}, {
    __index = function(_, key)
      local modulated = self.__propValuesModulated[key]
      if modulated then return modulated end

      return self.__propValues[key]
    end,
  })

  Utils.callIfExists(self.setup, self)
end

function Module:serializeDefinition()
  local props = {}
  for key, definition in pairs(self.__definition.props or {}) do
    local Component, options = unpack(definition)
    props[key] = { Component.__type, options }
  end

  return {
    id = self.__type,
    inputs = self.__definition.inputs,
    outputs = self.__definition.outputs,
    shape = self.__definition.shape,
    label = self.__definition.label,
    clipContent = self.__definition.clipContent,
    props = props,
  }
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
  for index, connection in pairs(self.__outputs[outputIndex] or {}) do
    if connection[0] == moduleId and connection[1] == inputIndex then
      connection[index] = nil
      return
    end
  end
end

---@param index number
---@param message MidiMessage|nil
---@param cable number
function Module:output(index, message, cable)
  local signal = message and 'midi' or 'trigger'
  local isNoteOn = message and message:is(Midi.NoteOn)
  local isNoteOff = message and message:is(Midi.NoteOff)

  if isNoteOn or isNoteOff then
    ---@cast message MidiNoteOn | MidiNoteOff
    local activeNoteKey = Utils.packBytes(index, message.note, message.channel)
    self.__activeNotes[activeNoteKey] = isNoteOn and true or nil
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

function Module:__output(index, message)
  if self.__outputs[index] then
    for _, input in pairs(self.__outputs[index]) do
      local inputId, inputIndex = unpack(input)
      local inputModule = Miwos.patch and Miwos.patch.modules[inputId]
      if inputModule then
        local name = message and message.name or 'trigger'
        local numberedInput = 'input[' .. inputIndex .. ']'

        inputModule:callEvent('input', inputIndex, message)
        inputModule:callEvent('input:' .. name, inputIndex, message)
        inputModule:callEvent(numberedInput, message)
        inputModule:callEvent(numberedInput .. ':' .. name, message)
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

function Module.__hmrAccept(definition)
  if Miwos.patch then Miwos.patch:updateModuleDefinition(definition) end
end

function Module.__hmrDecline(definition)
  return true
  -- We only want to hot replace actual modules, not the (abstract) module base
  -- class itself. Only modules registered with `Miwos.defineModule()` have a
  -- `__type`.
  -- return not definition.__type
end

return Module
