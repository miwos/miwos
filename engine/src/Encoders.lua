Encoders = _G.Encoders or {}
Encoders.__events = {}

Utils.mixin(Encoders, require('EventEmitter'))
Encoders.__events = {}

function Encoders.handleChange(index, value)
  Encoders:emit('change', index, value)
end
