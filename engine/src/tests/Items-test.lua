local class = require('class')
local Item = require('Item')

describe('Items', function()
  it('hot replaces instances', function()
    Items.add(1, 'Input', { device = 5 })

    ---@class __TestNewInput : Item
    local newInput = class(Item)
    newInput.__type = 'Input'
    newInput.__definition = {}
    newInput.__hasBeenReplaced = true

    Items.hotReplace(newInput)
    ---@diagnostic disable-next-line: undefined-field
    expect(Items.instances[1].__hasBeenReplaced):toBe(true)
    expect(Items.instances[1].props.device):toBe(5)

    Items.clear()
  end)

  it('updates props', function()
    local mock = Miwos.defineModule('__MockItem', {
      props = { num = Prop.Number({ min = 0, max = 1, value = 1, step = 1 }) },
    })
    _LOADED['items.__MockItem'] = mock

    local handleBeforeChange = Test.fn()
    mock:event('prop:beforeChange', handleBeforeChange)

    local handleBeforeNamedChange = Test.fn()
    mock:event('prop[num]:beforeChange', handleBeforeNamedChange)

    local handleChange = Test.fn()
    mock:event('prop:change', handleChange)

    local handleNamedChange = Test.fn()
    mock:event('prop[num]:change', handleNamedChange)

    Items.add(1, '__MockItem', { num = 3 })
    local instance = Items.instances[1]

    Items.updateProp(1, 'num', 4, false)
    expect(instance.props.num):toBe(4)

    expect(handleBeforeChange):toBeCalledTimes(1)
    expect(handleBeforeChange):toBeCalledWith(instance, 'num', 4)

    expect(handleBeforeNamedChange):toBeCalledTimes(1)
    expect(handleBeforeNamedChange):toBeCalledWith(instance, 4)

    expect(handleChange):toBeCalledTimes(1)
    expect(handleChange):toBeCalledWith(instance, 'num', 4)

    expect(handleNamedChange):toBeCalledTimes(1)
    expect(handleNamedChange):toBeCalledWith(instance, 4)

    Items.clear()
  end)

  it('updates modulated props', function()
    local propOptions = { min = 0, max = 10, value = 1, step = 1 }
    local item = Miwos.defineModule(
      '__MockItem',
      { props = { num = Prop.Number(propOptions) } }
    )
    _LOADED['items.__MockItem'] = item

    local modulator = Miwos.defineModulator('__MockModulator', {})
    _LOADED['items.__MockModulator'] = modulator
    function modulator:value(time)
      return time
    end

    Items.add(1, '__MockModulator', {})
    Items.add(2, '__MockItem', { num = 3 })
    Modulations.add(1, 2, 'num', 0.75)

    Modulations.update(0.5, false)

    local modulatedValue =
      Miwos.definitions.props.Number.modulateValue(3, 0.5, 0.75, propOptions)

    local instance = Items.instances[2]
    expect(instance.props.num):toBe(modulatedValue)
    expect(instance.props.__values.num):toBe(3)

    Items.clear()
  end)
end)
