describe('Timer', function()
  it('delays an event', function()
    local event = Test.fn()
    local delay = 1000

    Timer.delay(event, delay)
    Timer.update(Timer.millis())
    expect(event):notToBeCalled()

    Timer.update(Timer.millis() + delay)
    expect(event):toBeCalled()
  end)

  it('schedules an event', function()
    local event = Test.fn()
    local time = Timer.millis() + 1000

    Timer.schedule(event, time)

    Timer.update(Timer.millis())
    expect(event):notToBeCalled()

    Timer.update(time)
    expect(event):toBeCalled()
  end)

  it('cancels a delayed event', function()
    local event = Test.fn()
    local delay = 1000

    Timer.delay(event, delay)
    Timer.cancel(event)
    Timer.update(Timer.millis() + delay)

    expect(event):notToBeCalled()
  end)

  it('cancels a scheduled event', function()
    local event = Test.fn()
    local time = Timer.millis() + 1000

    Timer.schedule(event, time)
    Timer.cancel(event)
    Timer.update(time)

    expect(event):notToBeCalled()
  end)
end)
