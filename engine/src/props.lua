local mt = {
  __index = function(self, key)
    local modulated = self.__modulatedValues[key]
    if modulated ~= nil then
      return modulated
    else
      return self.__values[key]
    end
  end,

  __newindex = function(self, key, value)
    Miwos:emit('prop:change', self.__item.__id, key, value)
    self.__values[key] = value
  end,
}

---@param values table<string, any>
---@return table<string, any>
local function createProps(item, values)
  return setmetatable({
    __item = item,
    __values = values,
    __modulatedValues = {},
  }, mt)
end

return createProps
