---@meta

---@class Modulator : Item
---@field value fun(self: Modulator, time: number): number

---@class ModulatorDefinition : ItemDefinition
---@field bipolar boolean?

---@class ModulatorDefinitionSerialized : ItemDefinitionSerialized, ModulatorDefinition
