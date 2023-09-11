local Number = require('ui.components.Number')
local Button = require('ui.components.Button')
local Component = require('Component')

---@class ValueProps
---@field value any

---@class Prop
---@field Number fun(props: NumberProps)
---@field Button fun(props: ButtonProps)
---@field Value fun(props: ValueProps)
Prop = {}

setmetatable(Prop, {
  __index = function(_, name)
    return function(options, ...)
      -- Lua objects don't have an order (which we need to diplay the props in
      -- the app). We could use an array instead, but it would be more verbose.
      -- As a workaround we use a global counter `__propIndex` that is increased
      -- with each `Prop.<name>()` and is reset in `Miwos.defineComponent()`.
      if _G.__propIndex == nil then _G.__propIndex = 1 end
      options = options == nil and {} or options
      options.index = _G.__propIndex
      _G.__propIndex = _G.__propIndex + 1

      -- The `Value` Prop is an invisble prop just for persistently storing
      -- stuff, so it should never be listed.
      if name == 'Value' then options.listed = false end

      local component = Miwos.definitions.props[name].component
      return { name, options, component }
    end
  end,
})

Miwos.defineProp('Number', {
  component = Number,
  modulateValue = function(value, modulation, amount, options)
    local modulationRange = (options.max - options.min) * (amount / 2)
    local newValue = value + modulationRange * modulation
    return math.min(math.max(newValue, options.min), options.max)
  end,
})

Miwos.defineProp('Button', {
  component = Button,
  modulateValue = function(value, modulation, amount, options)
    -- TODO: implement
    return value
  end,
})

Miwos.defineProp('Value', {
  modulateValue = function() end,
})
