Test = {
  fn = require('Test.mock'),
  expect = require('Test.expect'),
  summary = require('Test.summary'),
}

function Test.reset()
  Test._depth = 0
  Test._files = { total = 0, failed = 0 }
  Test._suites = { total = 0, failed = 0 }
  Test._tests = { total = 0, failed = 0 }
end

---@param n number
function Test.depth(n)
  Test._depth = Test._depth + n
end

---@param text string
---@param n? number
function Test.print(text, n)
  n = n or 0
  print(Utils.indent(Test._depth + n) .. text)
end

function Test.serialize(...)
  local args = { ... }
  if #args == 1 then
    local value = args[1]
    if type(value) == 'table' and type(value.serialize) == 'function' then
      return Utils.maskCurlyBraces(value:serialize())
    else
      return Utils.maskCurlyBraces(Utils.serialize(value, true))
    end
  else
    local parts = {}
    for _, v in pairs(args) do
      parts[#parts + 1] = Test.serialize(v)
    end
    return table.concat(parts, ', ')
  end
end

function Test.runFile(fileName)
  Test._currentFile = { name = fileName, hasFailed = false }
  Test._files.total = Test._files.total + 1

  loadfile(fileName)()

  if not Test._currentFile.hasFailed then
    local colorized = string.gsub(
      fileName,
      '(.*/)(.*)(-test.lua)',
      '{success √} {gray %1}%2{gray %3} '
    )
    print(colorized)
  end

  return Test._currentFile.hasFailed
end

---@param dirName string
function Test.runDir(dirName)
  Test.reset()
  local files = FileSystem.listFiles(dirName)
  for _, baseName in pairs(files) do
    Test.runFile(dirName .. '/' .. baseName)
  end
end

---@param name string
---@param fn function
function Test.describe(name, fn)
  Test._currentSuite = { name = name, hasFailed = false }
  Test._suites.total = Test._suites.total + 1

  Test.depth(1)
  fn()
  Test.depth(-1)
end

---@param name string
---@param fn function
function Test.test(name, fn)
  Test._currentTest = { name = name, hasFailed = false }
  Test._tests.total = Test._tests.total + 1

  Test.depth(2)
  fn()
  Test.depth(-2)
end

-- Init
Test.reset()

describe = Test.describe
expect = Test.expect
test = Test.test
it = Test.test
