local PropsView = Miwos.defineComponent('PropsView')
local Buttons = require('ui.components.Buttons')
local Leds = require('ui.components.Leds')

function PropsView:setup()
  self.pageIndex = 1
  self.page = self.props.patch.mappings[self.pageIndex] or {}
end

function PropsView:mount()
  self:renderPage()

  self.propChangeHandler = Miwos:on('prop:change', function(itemId, name, value)
    for _, slot in pairs(self.children) do
      if slot.__itemId == itemId and slot.__propName == name then
        slot:setProp('value', value)
      end
    end
  end)

  self.patchChangeHandler = Miwos:on('patch:change', function()
    -- Refresh mappings page.
    self.page = self.props.patch.mappings[self.pageIndex] or {}
    self:renderPage()
  end)
end

function PropsView:render()
  return { buttons = Buttons(), leds = Leds() }
end

function PropsView:renderPage()
  for i = 1, 3 do
    local child = self.children['slot' .. i]
    if child then self:removeChild(child) end

    local ledState = i == self.pageIndex
    local ledIndex = i + 3 -- leds 4,5,6 represent pages 1,2,3
    self.children.leds:toggle(ledIndex, ledState)
  end

  local emptySlots = { 1, 2, 3 }
  for slot, mapping in pairs(self.page) do
    local item, propName = unpack(mapping)
    local propValue = item.props[propName]
    local propDefinition = item.__definition.props[propName]

    if propDefinition then
      emptySlots[slot] = nil
      local Component, props = unpack(item.__definition.props[propName])

      props.value = propValue
      props.label = Utils.capitalize(propName)

      local component = Component(props, { slot = slot })
      component.__propName = propName
      component.__itemId = item.__id

      self:addChild('slot' .. slot, component)
    else
      Log.warn(
        string.format("couldn't find prop '%s' in %s", propName, item.__type)
      )
    end
  end

  for _, slot in pairs(emptySlots) do
    Displays.clear(slot)
    Displays.update(slot)
  end
end

PropsView:event('buttons:click', function(self, index)
  if index < 4 or index > 6 then return end
  self.pageIndex = index - 3 -- buttons 4,5,6 select page 1,2,3
  self.page = self.props.patch.mappings[self.pageIndex] or {}
  self:renderPage()
end)

PropsView:event('slot1:updateValue', function(self, value)
  self:handlePropUpdate(1, value)
end)

PropsView:event('slot2:updateValue', function(self, value)
  self:handlePropUpdate(2, value)
end)

PropsView:event('slot3:updateValue', function(self, value)
  self:handlePropUpdate(3, value)
end)

function PropsView:handlePropUpdate(slot, value)
  local mapping = self.page[slot]
  if not mapping then
    Log.warn(string.format('mapping for slot %s not found', slot))
    return
  end

  local item, propName = unpack(self.page[slot])
  self.props.patch:updatePropValue(item.__id, propName, value)
end

function PropsView:unmount()
  Miwos:off('prop:change', self.propChangeHandler)
  Miwos:off('patch:change', self.patchChangeHandler)
end

return PropsView
