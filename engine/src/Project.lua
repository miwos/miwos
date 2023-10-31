Project = {}

---@param serialized ProjectSerialized
function Project.deserialize(serialized)
  Items.deserialize(serialized.items)
end

---@param name string
---@param updateApp boolean? default: true
function Project.open(name, updateApp)
  local data = loadfile('lua/projects/' .. name .. '/part-1.lua')()
  Project.deserialize(data)
  if Utils.option(updateApp, true) then
    Bridge.notify('/n/project/open', name)
  end
end

return Project
