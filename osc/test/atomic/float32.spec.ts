import { beforeEach, describe, expect, it } from 'vitest'
import AtomicFloat32 from '../../src/atomic/float32'

describe('AtomicFloat32', () => {
  const bitArray = {
    0: 70, 1: 25, 2: 124, 3: 237,
  }

  let atomic: AtomicFloat32

  beforeEach(() => {
    atomic = new AtomicFloat32(9823.2312155)
  })

  describe('pack', () => {
    let result: Uint8Array

    beforeEach(() => {
      result = atomic.pack()
    })

    it('returns correct bits', () => {
      expect(JSON.stringify(result)).to.equal(JSON.stringify(bitArray))
    })
  })

  /** @test {AtomicFloat32#unpack} */
  describe('unpack', () => {
    let returnValue: number

    beforeEach(() => {
      const data = new Uint8Array(8)
      const dataView = new DataView(data.buffer)

      dataView.setFloat32(0, 1.254999123, false)

      returnValue = atomic.unpack(dataView, 0)
    })

    it('returns a number', () => {
      expect(returnValue).to.be.a('number')
    })

    it('sets the offset to 4', () => {
      expect(atomic.offset).to.equal(4)
    })

    it('sets the value to a human readable float number', () => {
      expect(atomic.value).to.equal(Math.fround(1.254999123))
    })
  })
})
