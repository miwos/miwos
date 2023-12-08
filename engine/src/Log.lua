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
  for i = 1, #args do
    Log._log(LogType.Dump, Utils.serialize(args[i]))
  end
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

-- Monkey-patch lua's `print()` function so it always calls `Log#flush()`. This
-- is important because we use a SLIP serial and the the printed output might
-- not be displayed in the console immediately otherwise.
local oldPrint = print
function print(...)
  Log._beginPacket()
  oldPrint(...)
  Log._endPacket()
end

Log.messageItemNotFound = function(id)
  return string.format('item with id `%s` not found', id)
end
