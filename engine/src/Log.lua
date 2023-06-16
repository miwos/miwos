local Utils = require('Utils')

Log = _G.Log or {}

---@enum LogType
local LogType = {
  Info = 1,
  Warn = 2,
  Error = 3,
  Dump = 4,
}

---@param type LogType
---@param ... unknown
function Log.log(type, ...)
  local args = { ... }
  local message = ''
  for i = 1, #args do
    message = message .. (i > 1 and ', ' or '') .. tostring(args[i])
  end
  Log._log(type, message)
end

function Log.error(...)
  Log.log(LogType.Error, ...)
end

function Log.warn(...)
  Log.log(LogType.Warn, ...)
end

function Log.info(...)
  Log.log(LogType.Info, ...)
end

function Log.dump(...)
  local args = { ... }
  local dump = ''

  for i = 1, #args do
    local value = args[i]
    dump = dump .. (i > 1 and ', ' or '') .. Utils.serialize(value)
  end

  Log._log(LogType.Dump, dump)
end

local timers = {}

---@param label string
function Log.time(label)
  timers[label] = Timer.micros()
end

---@param label string
function Log.timeEnd(label)
  Log.info(label .. ': ' .. Timer.micros() - timers[label] .. 'μs')
  timers[label] = nil
end
