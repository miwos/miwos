Buttons = _G.Buttons or {}

Utils.mixin(Buttons, require('EventEmitter'))
Buttons.__events = {}

---@param index number
---@param duration number
function Buttons.handleClick(index, duration)
  Buttons:emit('click', index, duration)
  if index >= 7 and index <= 9 then Encoders:emit('click', index - 6) end
end
