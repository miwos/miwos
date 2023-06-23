local mt = {
  __index = function(self, key)
    local modulated = self.__modulatedValues[key]
    if modulated ~= nil then
      return modulated
    else
      return self.__values[key]
    end
  end,
}

---@param values table<string, any>
---@return table<string, any>
local function createProps(values)
  return setmetatable({
    __values = values,
    __modulatedValues = {},
  }, mt)
end

return createProps
