local Display = require('ui.components.Display')
local Encoder = require('ui.components.Encoder')
local LabelValue = require('ui.components.LabelValue')

---@class SelectProps
---@field value number
---@field options string[]
---@field label string ?

---@class Select : Component
---@field props SelectProps
local Select = Miwos.defineComponent('Select')

function Select:setup()
  self.selectedIndex = self.props.value
  self.activeIndex = self.selectedIndex
  -- TODO: add some kind of encoder acceleration
  local ticksPerValue = 5
  self.encoderMax = #self.props.options * ticksPerValue
end

function Select:render()
  return {
    display = Display(),
    encoder = Encoder(),
    labelValue = LabelValue({
      x = 0,
      y = 0,
      width = Display.width,
      height = Display.height - 9,
      label = self.props.label,
    }),
  }
end

function Select:mount()
  local encoder = self.children.encoder --[[@as Encoder]]
  encoder:setRange(0, self.encoderMax)
  encoder:write(0)
  self:draw()
end

function Select:draw()
  local props = self.props
  local display = self.children.display --[[@as Display]]

  local x = 0
  local width = Display.width
  local height = 9
  local y = Display.height - height
  local centerY = y + (height / 2)

  -- Clear
  display:drawRectangle(x, y, width, height, Display.Color.Black, true)

  -- Dots
  local radiusLarge = 4
  local radiusSmall = 1
  local padding = radiusLarge
  local innerWidth = (width - padding * 2)
  local dotDistance = math.floor(innerWidth / (#props.options - 1))
  local dotY = centerY
  for i = 1, #props.options do
    local dotX = dotDistance * (i - 1) + padding
    local isSelected = i == self.selectedIndex
    local isActive = i == self.activeIndex
    local radius = (isSelected or isActive) and radiusLarge or radiusSmall
    display:drawCircle(dotX, dotY, radius, Display.Color.White, isSelected)
  end

  display:update()
end

Select:event('labelValue:showLabel', function(self)
  ---@cast self Select
  local encoder = self.children.encoder --[[@as Encoder]]
  self.activeIndex = self.selectedIndex
  encoder:write(
    Utils.mapValue(self.activeIndex, 1, #self.props.options, 0, self.encoderMax)
  )
  self:draw()
end)

Select:event('encoder:change', function(self, rawValue)
  ---@cast self Select
  local index = self:decodeValue(rawValue)
  self.children.labelValue:setProp('value', self.props.options[index])
  self.activeIndex = index
  self:draw()
end)

Select:event('encoder:click', function(self)
  ---@cast self Select
  self.selectedIndex = self.activeIndex
  self:emit('updateValue', self.activeIndex)
  self:draw()
end)

Select:event('prop[value]:change', function(self, value)
  ---@cast self Select
  local encoder = self.children.encoder --[[@as Encoder]]
  encoder:write(self:encodeValue(value))
  self.selectedIndex = value
  self.activeIndex = value
  self:draw()
end)

function Select:encodeValue(value)
  return Utils.mapValue(value, 1, #self.props.options, 0, self.encoderMax)
end

function Select:decodeValue(rawValue)
  return math.floor(
    Utils.mapValue(rawValue, 0, self.encoderMax, 1, #self.props.options)
  )
end

return Select
