---@class ModuleClip : Module
local Clip = Miwos.defineModule('Clip', {
  shape = 'Clip',
  showLabel = false,
  props = {
    rec = Prop.Button({ toggle = true, value = false }),
    play = Prop.Button({ toggle = true, value = false }),
    loop = Prop.Button({ toggle = true, value = false }),
  },
  inputs = { 'midi', 'trigger' },
  outputs = { 'midi' },
})

Clip.__hmrKeep = { 'recording' }

function Clip:setup()
  self.isRecording = false
  self.recording = {}
  self.recordStartTime = 0

  self.playStartTime = 0
  self.playIndex = 1

  self.scheduleAheadTime = 4 -- ticks
  self.scheduleInterval = 25 -- ms
  self.scheduleTimer = nil
end

---@param message MidiMessage
function Clip:record(message)
  if not self.isRecording then return end

  if message:is(Midi.NoteOn) or message:is(Midi.NoteOff) then
    local time = Timer.ticks() - self.recordStartTime
    local bytes = message:toBytes()
    self.recording[#self.recording + 1] = { time, bytes }
  end
end

function Clip:clear()
  self:togglePlay(false)
  self.props.play = false
  self.recording = {}
end

function Clip:toggleRecord(state)
  self.isRecording = state
  if state then
    self:clear()
    self.recordStartTime = Timer.ticks()
  end
end

function Clip:togglePlay(state)
  if state then
    self.playStartTime = Timer.ticks()
    self.playIndex = 1
    self:schedule()
  else
    Timer.cancel(self.scheduleTimer)
    self:__finishNotes()
  end
end

function Clip:schedule()
  local playTime = Timer.ticks() - self.playStartTime
  local scheduleUntilTime = playTime + self.scheduleAheadTime

  while
    self.playIndex <= #self.recording
    and self.recording[self.playIndex]
    and self.recording[self.playIndex][1] < scheduleUntilTime
  do
    local time, bytes = unpack(self.recording[self.playIndex])
    local type, data1, data2, channel = Utils.unpackBytes(bytes)

    local message = Midi.Message(type, data1, data2, channel)
    self:scheduleOutput(1, message, time, true)

    self.playIndex = self.playIndex + 1
  end

  local isFinished = self.playIndex > #self.recording
  local isLoop = self.props.loop

  if isFinished and not isLoop then
    self:__finishNotes()
    self.props.play = false
    return
  end

  if isFinished and isLoop then
    self.playIndex = 1
    local lastEntry = self.recording[#self.recording]
    local duration = lastEntry and lastEntry[1] or 0
    self.playStartTime = self.playStartTime + duration
  end

  self:requestNextSchedule()
end

function Clip:requestNextSchedule()
  self.scheduleTimer = Timer.delay(function()
    self:schedule()
  end, self.scheduleInterval)
end

Clip:event('prop[rec]:change', Clip.toggleRecord)
Clip:event('prop[play]:change', Clip.togglePlay)
Clip:event('prop[rec]:longClick', Clip.clear)
Clip:event('input[1]', Clip.record)

return Clip
