import { beforeEach, describe, expect, it } from 'vitest'
import AtomicUInt64 from '../../src/atomic/uint64'

const MAX_UINT64 = BigInt('18446744073709551615')

describe('AtomicUInt64', () => {
  const bitArray = {
    0: 255, 1: 255, 2: 255, 3: 255, 4: 255, 5: 255, 6: 255, 7: 255,
  }

  let atomic: AtomicUInt64

  beforeEach(() => {
    atomic = new AtomicUInt64(MAX_UINT64)
  })

  describe('bounds', () => {
    it('throws an error in constructor if out of bounds', () => {
      expect(() => { new AtomicUInt64(MAX_UINT64 + BigInt('1')) }).to.throw('OSC AtomicUInt64 value is out of bounds')
      expect(() => { new AtomicUInt64(BigInt('-1')) }).to.throw('OSC AtomicUInt64 value is out of bounds')
    })
  })

  describe('pack', () => {
    let result: any

    beforeEach(() => {
      result = atomic.pack()
    })

    it('returns correct bits', () => {
      expect(JSON.stringify(result)).to.equal(JSON.stringify(bitArray))
    })
  })

  describe('unpack', () => {
    let returnValue: any

    beforeEach(() => {
      const data = new Uint8Array(8)
      const dataView = new DataView(data.buffer)

      dataView.setBigInt64(0, BigInt.asUintN(64, MAX_UINT64), false)

      returnValue = atomic.unpack(dataView, 0)
    })

    it('returns a number', () => {
      expect(returnValue).to.be.a('number')
    })

    it('sets the offset to 4', () => {
      expect(atomic.offset).to.equal(8)
    })

    it('sets the value to a human readable number', () => {
      const res = atomic.value === MAX_UINT64
      expect(res).to.be.true
    })
  })
})
