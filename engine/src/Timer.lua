---@class Timer
---@field _scheduleMidi fun(time: number, useTicks: boolean, type: number, data1: number, data2: number, channel: number, deviceIndex: number, cable: number): boolean
---@field clearScheduledMidi fun()
---@field millis fun(): number
---@field micros fun(): number
---@field ticks fun(): number
Timer = _G.Timer or {}
Timer.Sec = 1000000
Timer.Milli = 1000
local events = {}
local lastModulationUpdate = 0
local modulationUpdateInterval = 1000 / 24 -- fps

---@param now number
function Timer.update(now)
  local finishedCallbacks = {}

  for callback, time in pairs(events) do
    if time <= now then
      events[callback] = nil
      finishedCallbacks[#finishedCallbacks + 1] = callback
    end
  end

  for _, callback in ipairs(finishedCallbacks) do
    callback()
  end

  if (now - lastModulationUpdate) > modulationUpdateInterval then
    Modulations.update(now)
    lastModulationUpdate = now
  end
end

function Timer.schedule(callbackOrMessage, ...)
  if Utils.isCallable(callbackOrMessage) then
    return Timer.scheduleCallback(callbackOrMessage, ...)
  else
    return Timer.scheduleMidi(callbackOrMessage, ...)
  end
end

function Timer.scheduleCallback(callback, time)
  events[callback] = time
  return callback
end

function Timer.scheduleMidi(message, device, cable, time, useTicks)
  local data1, data2 = message:data()
  Timer._scheduleMidi(
    time,
    useTicks,
    message.type,
    data1,
    data2,
    message.channel,
    device,
    cable
  )
end

---@param callback function
---@param delay number
---@return function callback
function Timer.delay(callback, delay)
  events[callback] = Timer.millis() + delay
  return callback
end

---@param callback function
function Timer.cancel(callback)
  if callback then events[callback] = nil end
end
