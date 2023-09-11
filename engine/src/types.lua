---@meta

---@alias Signal 'midi' | 'trigger'

---@alias ItemCategory 'modules' | 'modulators'

---@class Item : Class
---@field __category ItemCategory
---@field __type string
---@field __id number
---@field __destroy function | nil
---@field __definition ItemDefinition
---@field props table
---@field serializeDefinition function | nil

---@class ItemDefinition
---@field props table<string, Prop>

---@class ModuleDefinition : ItemDefinition
---@field inputs Signal[]?
---@field outputs Signal[]?
---@field shape string?
---@field clipContent boolean?
---@field showLabel boolean?
---@field label string?
---@field constructor Module?

---@class ModulatorDefinition : ItemDefinition
---@field bipolar boolean?
---@field props table<string, Prop>?
---@field constructor Modulator?

---@class PropDefinition
---@field modulateValue fun(value: number, modulation: number, amount: number, options: table): number ?
---@field component Component?
