---@class EncoderProps
---@field index ?number

---@class Encoder : Component
---@field props EncoderProps
local Encoder = Miwos.defineComponent('Encoder')

function Encoder:setup()
  self.index = self.props.index or self.ctx.slot or 1

  self.eventHandler = Encoders:on('*', function(event, index, ...)
    if index == self.index then self:emit(event, ...) end
  end)
end

function Encoder:write(value)
  Encoders.write(self.index, value)
end

function Encoder:setRange(min, max)
  Encoders.setRange(self.index, min, max)
end

function Encoder:unmount()
  Encoders:off('*', self.eventHandler)
end

return Encoder
