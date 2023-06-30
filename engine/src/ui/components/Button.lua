local LabelValue = require('ui.components.LabelValue')
local Encoder = require('ui.components.Encoder')
local Display = require('ui.components.Display')

---@class ButtonProps
---@field value boolean
---@field label string
---@field toggle boolean

---@class Button : Component
---@field props ButtonProps
local Button = Miwos.defineComponent('Button')

function Button:render()
  return {
    display = Display(),
    encoder = Encoder(),
    labelValue = LabelValue({
      x = 0,
      y = 0,
      width = Display.width,
      height = Display.height - 8,
      label = self.props.label,
    }),
  }
end

function Button:mount()
  self:draw()
end

function Button:draw()
  local display = self.children.display --[[@as Display]]
  local Color = display.Color

  local width = 14
  local height = 8
  local buttonHeight = self.props.value and 5 or height
  local buttonWidth = 8
  local x = 0
  local y = Display.height - height

  -- Clear
  display:drawRectangle(x, y, width, height, Color.Black, true)

  -- Knob
  display:drawRoundedRectangle(
    x + 3,
    y + (height - buttonHeight),
    buttonWidth,
    buttonHeight,
    1,
    Color.White,
    true
  )

  -- Base
  display:drawLine(x, y + height - 1, x + width, y + height - 1, Color.White)

  display:update()
end

Button:event('encoder:click', function(self)
  ---@cast self Button
  if self.props.toggle then
    self.props.value = not self.props.value
    self:draw()
  end
  self:emit('updateValue', self.props.value)
end)

return Button
