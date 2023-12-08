import { beforeEach, describe, expect, it } from 'vitest'
import AtomicBlob from '../../src/atomic/blob'

describe('AtomicBlob', () => {
  const bitArray = {
    0: 0, 1: 0, 2: 0, 3: 5, 4: 54, 5: 42, 6: 11, 7: 33, 8: 66, 9: 0, 10: 0, 11: 0,
  }

  let atomic: AtomicBlob

  beforeEach(() => {
    atomic = new AtomicBlob(new Uint8Array([54, 42, 11, 33, 66]))
  })

  describe('pack', () => {
    let result: Uint8Array

    beforeEach(() => {
      result = atomic.pack()
    })

    it('returns correct bits', () => {
      expect(JSON.stringify(result)).to.equal(JSON.stringify(bitArray))
    })

    it('returns the first 8 bit for the size of the data', () => {
      const dataView = new DataView(result.buffer)
      expect(dataView.getInt32(0, false)).to.equal(5)
    })
  })

  describe('unpack', () => {
    let returnValue: number

    beforeEach(() => {
      const data = new Uint8Array([0, 0, 0, 7, 1, 2, 3, 4, 5, 6, 7])
      const dataView = new DataView(data.buffer)

      returnValue = atomic.unpack(dataView, 0)
    })

    it('returns a number', () => {
      expect(returnValue).to.be.a('number')
    })

    it('sets the offset to 12', () => {
      expect(atomic.offset).to.equal(12)
    })

    it('sets the value to our blob', () => {
      expect(JSON.stringify(atomic.value)).to.equal(
        JSON.stringify({
          0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7,
        }),
      )
    })
  })
})
