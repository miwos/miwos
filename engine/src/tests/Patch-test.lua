local Patch = require('Patch')
local class = require('class')
local Module = require('Module')

require('modules.Input')
require('modulators.Lfo')

describe('Patch', function()
  it('adds and removes items', function()
    ---@type Patch
    local patch = Patch()

    patch:addItem(1, 'modules', 'Input', { device = 5 })
    local item = patch.items[1]

    expect(item.__id):toBe(1)
    expect(item.__type):toBe('Input')
    expect(item.props.device):toBe(5)

    patch:removeItem(1)
    expect(Utils.getTableLength(patch.items)):toBe(0)
  end)

  it('retrieves an item', function()
    ---@type Patch
    local patch = Patch()

    patch:addItem(1, 'modules', 'Input', {})
    expect(patch:getItem(1)):toBe(patch.items[1])
  end)

  it('updates item instances', function()
    ---@type Patch
    local patch = Patch()
    patch:addItem(1, 'modules', 'Input', { device = 5 })

    local newInput = class(Module)
    newInput.__type = 'Input'
    newInput.__definition = {}
    newInput.__hasBeenReplaced = true

    patch:updateItemInstances(newInput --[[@as Item]])
    ---@diagnostic disable-next-line: undefined-field
    expect(patch.items[1].__hasBeenReplaced):toBe(true)
    expect(patch.items[1].props.device):toBe(5)
  end)

  it('adds and removes mappings', function()
    ---@type Patch
    local patch = Patch()
    patch:addItem(1, 'modules', 'Input', { device = 5 })

    patch:addMapping(1, 1, 1, 'device')
    expect(patch.mappings[1][1][1]):toBe(patch.items[1])
    expect(patch.mappings[1][1][2]):toBe('device')

    patch:removeMapping(1, 1)
    expect(Utils.getTableLength(patch.mappings[1])):toBe(0)
  end)

  it('adds and removes modulations', function()
    ---@type Patch
    local patch = Patch()
    patch:addItem(1, 'modulators', 'Lfo', {})
    patch:addItem(2, 'modules', 'Input', { device = 5 })

    patch:addModulation(1, 2, 'device', 0.75)
    local modulator = patch.items[1]
    local module = patch.items[2]
    expect(patch.modulations[1]):toEqual({ modulator, module, 'device', 0.75 })

    patch:removeModulation(1, 2, 'device')
    expect(Utils.getTableLength(patch.modulations)):toBe(0)
  end)

  it('retrieves modulation by prop', function()
    ---@type Patch
    local patch = Patch()
    patch:addItem(1, 'modulators', 'Lfo', {})
    patch:addItem(2, 'modules', 'Input', { device = 5 })

    patch:addModulation(1, 2, 'device', 0.75)
    patch:addModulation(1, 2, 'cable', 0.25)
    local modulation = patch:getPropModulation(2, 'device')

    local modulator = patch.items[1]
    local module = patch.items[2]
    expect(modulation):toEqual({ modulator, module, 'device', 0.75 })
  end)

  it('updates prop values', function()
    ---@type Patch
    local patch = Patch()

    local mock = Miwos.defineModule('__Mock', {
      props = {
        num = Prop.Number({ min = 0, max = 1, value = 1, step = 1 }),
      },
    })

    local handleBeforeChange = Test.fn()
    mock:event('prop:beforeChange', handleBeforeChange)

    local handleBeforeNamedChange = Test.fn()
    mock:event('prop[num]:beforeChange', handleBeforeNamedChange)

    local handleChange = Test.fn()
    mock:event('prop:change', handleChange)

    local handleNamedChange = Test.fn()
    mock:event('prop[num]:change', handleNamedChange)

    patch:addItem(1, 'modules', '__Mock', { num = 3 })
    local instance = patch:getItem(1) --[[@as Module]]

    patch:updatePropValue(1, 'num', 4, false)

    expect(instance.props.num):toBe(4)

    expect(handleBeforeChange):toBeCalledTimes(1)
    expect(handleBeforeChange):toBeCalledWith(instance, 'num', 4)

    expect(handleBeforeNamedChange):toBeCalledTimes(1)
    expect(handleBeforeNamedChange):toBeCalledWith(instance, 4)

    expect(handleChange):toBeCalledTimes(1)
    expect(handleChange):toBeCalledWith(instance, 'num', 4)

    expect(handleNamedChange):toBeCalledTimes(1)
    expect(handleNamedChange):toBeCalledWith(instance, 4)

    -- cleanup
    Miwos.definitions.modules['__Mock'] = nil
  end)

  it('modulates prop values', function()
    ---@type Patch
    local patch = Patch()

    local propOptions = { min = 0, max = 10, value = 1, step = 1 }
    Miwos.defineModule('__Mock', { props = { num = Prop.Number(propOptions) } })

    local mockModulator = Miwos.defineModulator('__Mock', {})
    function mockModulator:value(time)
      return time
    end

    patch:addItem(1, 'modulators', '__Mock', {})
    patch:addItem(2, 'modules', '__Mock', { num = 3 })
    patch:addModulation(1, 2, 'num', 0.75)

    local moduleInstance = patch:getItem(2) --[[@as Module]]
    patch:updateModulations(0.5)

    local modulatedValue =
      Miwos.definitions.props.Number.modulateValue(3, 0.5, 0.75, propOptions)

    expect(moduleInstance.props.num):toBe(modulatedValue)
    expect(moduleInstance.props.__values.num):toBe(3)

    -- cleanup
    Miwos.definitions.modules['__Mock'] = nil
    Miwos.definitions.modulators['__Mock'] = nil
  end)
end)
