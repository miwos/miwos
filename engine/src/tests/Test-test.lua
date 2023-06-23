describe('Test', function()
  test('expect toBe', function()
    expect(true):toBe(true)
    expect(false):toBe(false)
    expect(true):notToBe(false)

    local table = { mi = 'wos' }
    expect(table):toBe(table)
    expect(table):notToBe({ mi = 'wos' })

    expect(3):toBe(3)
    expect(3):notToBe('3')

    local fn = function() end
    expect(fn):toBe(fn)
  end)

  test('expect toBeCalled', function()
    local mockFn = Test.fn()
    expect(mockFn):notToBeCalled()

    mockFn()
    expect(mockFn):toBeCalled()
  end)

  test('expect toBeCalledTimes', function()
    local mockFn = Test.fn()
    mockFn()
    mockFn()
    mockFn()

    expect(mockFn):toBeCalledTimes(3)
  end)

  test('expect toBeCalledWith', function()
    local mockFn = Test.fn()
    mockFn('miwos', 3)

    expect(mockFn):toBeCalledWith('miwos', 3)
    expect(mockFn):notToBeCalledWith('miwos', 4)
  end)

  test('expect toEqual', function()
    expect('miwos'):toEqual('miwos') -- same as `toBe`
    expect('miwos'):notToEqual('fu')

    expect({ mi = 'wos' }):toEqual({ mi = 'wos' })
    expect({ mi = 'wos' }):notToEqual({ mi = 'fu' })
    expect({ mi = 'wos' }):notToEqual({ mi = 'wos', more = true })
  end)
end)
