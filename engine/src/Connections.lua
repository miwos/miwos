Connections = {}

---@param serialized ConnectionSerialized[]
function Connections.deserialize(serialized)
  for _, connection in pairs(serialized) do
    local fromId, fromIndex, toId, toIndex = unpack(connection)
    local item = Items.instances[fromId]
    if not item then error(Log.messageItemNotFound(fromId)) end
    item:__connect(fromIndex, toId, toIndex)
  end
end

---@param fromId number
---@param outputIndex number
---@param toId number
---@param inputIndex number
function Connections.add(fromId, outputIndex, toId, inputIndex)
  local fromItem = Items.instances[fromId]
  if not fromItem then error(Log.messageItemNotFound(fromId)) end
  fromItem:__connect(outputIndex, toId, inputIndex)
end

---@param fromId number
---@param outputIndex number
---@param toId number
---@param inputIndex number
function Connections.remove(fromId, outputIndex, toId, inputIndex)
  local fromItem = Items.instances[fromId]
  if not fromItem then error(Log.messageItemNotFound(fromId)) end
  fromItem:__disconnect(outputIndex, toId, inputIndex)
end
