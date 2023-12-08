---@meta

---@alias ItemCategory 'modules' | 'modulators'

---@class ItemSerialzied
---@field id number
---@field type string
---@field props table<string, any>

---@class ItemDefinition
---@field category ItemCategory
---@field props table<string, Prop>
---@field inputs Signal[]?
---@field outputs Signal[]?

---@class ItemDefinitionSerialized
---@field category ItemCategory
---@field props table<string, { [1]: string, [2]: table<string, any> }>
---@field inputs Signal[]?
---@field outputs Signal[]?
