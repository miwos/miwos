local ProgressBar = require('ui.components.ProgressBar')
local LabelValue = require('ui.components.LabelValue')
local Encoder = require('ui.components.Encoder')
local Display = require('ui.components.Display')

---@class NumberProps
---@field value number
---@field label string
---@field min number
---@field max number
---@field step number
---@field showScale boolean
---@field scaleUnit number
---@field scaleCount number
---@field zoom number | false
---@field before string?
---@field after string?

---@class Number : Component
---@field props NumberProps
local Number = Miwos.defineComponent('Number')

local function ease(x)
  return 1.383493
    + (0.00001915815 - 1.383493) / (1 + (x / 0.3963062) ^ 1.035488)
end

function Number:render()
  local props = self.props
  local scaleStep = 0

  if props.scaleCount then
    scaleStep = Display.width / props.scaleCount
  elseif props.scaleUnit then
    scaleStep = props.scaleUnit / (props.max - props.min) * Display.width
  else
    scaleStep = Display.width / (props.max - props.min)
  end

  return {
    encoder = Encoder(),
    progressBar = ProgressBar({
      x = 0,
      y = Display.height - 7,
      width = Display.width,
      height = 7,
      value = Utils.mapValue(props.value, props.min, props.max, 0, 1),
      showScale = props.showScale,
      scaleStep = scaleStep,
    }),
    labelValue = LabelValue({
      x = 0,
      y = 0,
      width = Display.width,
      height = Display.height - 7,
      label = props.label,
      before = props.before,
      after = props.after,
    }),
  }
end

function Number:mount()
  -- Define a good encoder sensitivity, that is, the amount of physical encoder
  -- rotation required to go from min to max value. We do this by defining a
  -- number of steps representing the max value. If we have a floating value
  -- (no step defined) we'll use at least 127 steps, otherwise it would be
  -- very difficult to make fine adjustments to, say, a floating value between 1
  -- and 5.
  local props = self.props
  local step = props.step
  local steps = props.max - props.min
  if step then steps = math.ceil(steps / step) end
  if not step then steps = math.max(steps, 127) end
  self.encoderMax = math.floor(ease(steps / 127) * 127)

  local encoder = self.children.encoder --[[@as Encoder]]
  encoder:setRange(0, self.encoderMax)
  encoder:write(self:encodeValue(props.value))

  self.isInteger = Utils.isInteger(props.step)
  self.zoomIsEnabled = false
  self.normalEncoderMax = nil
end

Number:event('encoder:change', function(self, rawValue)
  ---@cast self Number
  local props = self.props
  local value = self:decodeValue(rawValue)

  local displayValue
  if self.isInteger then
    displayValue = value
  else
    -- TODO adjust rounding based on step (e.g. deal with 0.001 step)
    displayValue = string.format('%.2f', value)
  end

  self.children.labelValue:setProp('value', displayValue)
  local normalizedValue = Utils.mapValue(value, props.min, props.max, 0, 1)
  self.children.progressBar:setProp('value', normalizedValue)

  local oldValue = props.value
  props.value = value
  if value ~= oldValue then self:emit('updateValue', value) end
end)

Number:event('encoder:press', function(self)
  ---@cast self Number
  local props = self.props
  local encoder = self.children.encoder --[[@as Encoder]]
  if not props.zoom then return end

  -- Zoom in the encoder range to allow finer adjustments.
  self.zoomIsEnabled = true
  self.normalEncoderMax = self.encoderMax
  self.encoderMax = self.encoderMax * props.zoom

  encoder:setRange(0, self.encoderMax)
  encoder:write(
    Utils.mapValue(props.value, props.min, props.max, 0, self.encoderMax)
  )
end)

Number:event('encoder:release', function(self)
  ---@cast self Number
  if not self.props.zoom then return end

  self.zoomIsEnabled = false
  local encoder = self.children.encoder --[[@as Encoder]]
  self.encoderMax = self.normalEncoderMax
  encoder:setRange(0, self.encoderMax)
  encoder:write(self:encodeValue(self.props.value))
end)

Number:event('prop[value]:change', function(self, value)
  local props = self.props
  local encoder = self.children.encoder --[[@as Encoder]]
  encoder:write(self:encodeValue(props.value))

  self.children.progressBar:setProp(
    'value',
    Utils.mapValue(props.value, props.min, props.max, 0, 1)
  )
end)

function Number:encodeValue(value)
  local props = self.props
  return Utils.mapValue(value, props.min, props.max, 0, self.encoderMax)
end

function Number:decodeValue(rawValue)
  local props = self.props
  local scaledValue =
    Utils.mapValue(rawValue, 0, self.encoderMax, props.min, props.max)

  return props.step and math.ceil(scaledValue / props.step) * props.step
    or scaledValue
end

return Number
