local assertions = {}

local function register(name, fn, text)
  assertions[name] = { fn, text }
end

local function toBe(a, b)
  return a == b
end

local function toBeCalled(mockFn)
  return mockFn.calls > 0
end

local function toBeCalledTimes(mockFn, n)
  return mockFn.calls == n
end

local function toBeCalledWith(mockFn, ...)
  local args = { ... }

  if #mockFn.args ~= #args then return false end

  for i = 1, #args do
    if args[i] ~= mockFn.args[i] then return false end
  end

  return true
end

local function toEqual(a, b)
  if type(a) ~= type(a) then return false end
  if type(a) ~= 'table' then return a == b end

  if Utils.getTableLength(a) ~= Utils.getTableLength(b) then return false end

  for key, valueA in pairs(a) do
    local valueB = b[key]
    if not toEqual(valueA, valueB) then return false end
  end

  return true
end

register('toBe', toBe)

register('toBeCalled', toBeCalled, function(isNot, received)
  local a = isNot and 0 or 1
  local b = received.calls
  return string.format(
    '{gray expected {success %s} calls, received {error %s} ',
    a,
    b
  )
end)

register('toBeCalledTimes', toBeCalledTimes, function(isNot, received, expected)
  local calls = received.calls

  if isNot then
    return string.format(
      'expected not {success %s} %s',
      expected,
      Utils.pluralize(expected, 'call')
    )
  else
    return string.format(
      'received {error %s} %s',
      calls,
      Utils.pluralize(calls, 'call')
    )
  end
end)

register('toBeCalledWith', toBeCalledWith, function(isNot, received, ...)
  if isNot then
    return string.format('expected not %s', Test.serialize(...))
  else
    local parts = {}
    local args = { ... }
    for i in pairs(received.args) do
      parts[i] = string.format(
        '{%s %s}',
        args[i] == received.args[i] and 'success' or 'error',
        Test.serialize(received.args[i])
      )
    end
    return 'received ' .. table.concat(parts, ', ')
  end
end)

register('toEqual', toEqual)

return assertions
