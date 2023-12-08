import { beforeEach, describe, expect, it } from 'vitest'
import AtomicInt64 from '../../src/atomic/int64'

const MAX_INT64 = BigInt('9223372036854775807')
const MIN_INT64 = BigInt('-9223372036854775808')

describe('AtomicInt64', () => {
  const bitArray = {
    0: 127, 1: 255, 2: 255, 3: 255, 4: 255, 5: 255, 6: 255, 7: 255,
  }

  let atomic: AtomicInt64

  beforeEach(() => {
    atomic = new AtomicInt64(MAX_INT64)
  })

  describe('bounds', () => {
    it('throws an error in constructor if out of bounds', () => {
      expect(() => { new AtomicInt64(MAX_INT64 + BigInt('1')) }).to.throw('OSC AtomicInt64 value is out of bounds')
      expect(() => { new AtomicInt64(MIN_INT64 + BigInt('-1')) }).to.throw('OSC AtomicInt64 value is out of bounds')
    })
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

  describe('unpack', () => {
    let returnValue: number

    beforeEach(() => {
      const data = new Uint8Array(8)
      const dataView = new DataView(data.buffer)

      dataView.setBigInt64(0, BigInt.asIntN(64, MAX_INT64), false)

      returnValue = atomic.unpack(dataView, 0)
    })

    it('returns a number', () => {
      expect(returnValue).to.be.a('number')
    })

    it('sets the offset to 4', () => {
      expect(atomic.offset).to.equal(8)
    })

    it('sets the value to a human readable number', () => {
      const res = atomic.value === MAX_INT64
      expect(res).to.be.true
    })
  })
})
