Buttons = _G.Buttons or {}

Utils.mixin(Buttons, require('EventEmitter'))
Buttons.__events = {}

---@param index number
---@param duration number
function Buttons.handleClick(index, duration)
  local event = duration < 2000 and 'click' or 'longClick'
  Buttons:emit(event, index)
  if index >= 7 and index <= 9 then Encoders:emit(event, index - 6) end
end
