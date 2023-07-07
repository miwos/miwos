Buttons = _G.Buttons or {}

Utils.mixin(Buttons, require('EventEmitter'))
Buttons.__events = {}

local eventNames = {
  -- 0 is `none`
  [1] = 'press',
  [2] = 'click',
  [3] = 'longClick',
}

---@param index number
---@param event number
function Buttons.handleEvent(index, event)
  local name = eventNames[event]
  -- Both `click` and `longClick` are also a `release` event.
  local isRelease = event > 1

  if isRelease then Buttons:emit('release', index) end
  Buttons:emit(name, index)

  -- Encoder 1,2,3 Buttons are 7,8,9
  if index >= 7 and index <= 9 then
    if isRelease then Encoders:emit('release', index - 6) end
    Encoders:emit(name, index - 6)
  end
end
