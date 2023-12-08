Project = {}

---@param serialized ProjectSerialized
function Project.deserialize(serialized)
  Items.deserialize(serialized.items)
  Connections.deserialize(serialized.connections)
  Mappings.deserialize(serialized.mappings)
  Modulations.deserialize(serialized.modulations)
end

---@param name string
---@param updateApp boolean? default: true
function Project.open(name, updateApp)
  local data = loadfile('lua/projects/' .. name .. '/part-1.lua')()
  Project.deserialize(data)
  if Utils.option(updateApp, true) then
    Bridge.notify('/n/project/open', name)
  end
  Miwos:emit('patch:change')
end

function Project.clear()
  Items.clear()
  -- Connections are stored in the item instances so they are also cleared.
  Modulations.clear()
  Mappings.clear()
end

return Project
