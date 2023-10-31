Connections = {}

---@param fromId number
---@param outputIndex number
---@param toId number
---@param inputIndex number
function Connections.add(fromId, outputIndex, toId, inputIndex)
  local fromItem = Items.instances[fromId]
  if not fromItem then error(Log.messageItemNotFound(fromId)) end

  ---? Add Error message?
  if not fromItem.__category == 'modules' then return end
  ---@cast fromItem Module

  fromItem:__connect(outputIndex, toId, inputIndex)
end

---@param fromId number
---@param outputIndex number
---@param toId number
---@param inputIndex number
function Connections.remove(fromId, outputIndex, toId, inputIndex)
  local fromItem = Items.instances[fromId]
  if not fromItem then error(Log.messageItemNotFound(fromId)) end

  ---? Add Error message?
  if not fromItem.__category == 'modules' then return end
  ---@cast fromItem Module

  fromItem:__disconnect(outputIndex, toId, inputIndex)
end
