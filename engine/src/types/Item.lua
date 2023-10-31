---@meta

---@alias ItemCategory 'modules' | 'modulators'

---@class Item : Class
---@field __type string
---@field __id number
---@field __category ItemCategory
---@field __definition ItemDefinition
---@field __serialize fun(): ItemSerialzied
---@field __saveState fun()
---@field __applyState fun(self: Item, state: table<string, any>)
---@field __destroy fun() | nil
---@field props table<string, any>

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
