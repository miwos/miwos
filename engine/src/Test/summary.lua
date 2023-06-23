local function printSummarySection(name, total, failed)
  local parts = {}

  if failed > 0 then
    parts[#parts + 1] = string.format('{error failed %s}', failed)
  end

  local passed = total - failed
  if passed then
    parts[#parts + 1] = string.format('{success passed %s}', passed)
  end

  print(
    string.format(
      '%s %s {gray of %s} ',
      name,
      table.concat(parts, '{gray ,} '),
      total
    )
  )
end

local function getSummary()
  print()
  printSummarySection('Files: ', Test._files.total, Test._files.failed)
  printSummarySection('Suites:', Test._suites.total, Test._suites.failed)
  printSummarySection('Tests: ', Test._tests.total, Test._tests.failed)
  return Test._tests.failed == 0
end

return getSummary
