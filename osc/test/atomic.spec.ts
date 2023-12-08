import { beforeEach, describe, expect, it } from 'vitest'
import Atomic from '../src/atomic'
import AtomicBlob from '../src/atomic/blob'
import AtomicFloat32 from '../src/atomic/float32'
import AtomicFloat64 from '../src/atomic/float64'
import AtomicInt32 from '../src/atomic/int32'
import AtomicInt64 from '../src/atomic/int64'
import AtomicString from '../src/atomic/string'
import AtomicTimetag, {
  SECONDS_70_YEARS,
  Timetag,
} from '../src/atomic/timetag'
import AtomicUInt64 from '../src/atomic/uint64'

describe('Atomic', () => {
  let atomicChildren: Atomic[]

  beforeEach(() => {
    atomicChildren = [
      new AtomicInt32(0),
      new AtomicInt32(123132132),
      new AtomicInt64(BigInt('0x7FFFFFFFFFFFFFFF')),
      new AtomicUInt64(BigInt('0xFFFFFFFFFFFFFFFF')),
      new AtomicFloat32(1299389992.342243),
      new AtomicFloat64(1299389992.342243),
      new AtomicString('hello'),
      new AtomicString(''),
      new AtomicBlob(new Uint8Array([5, 4, 3, 2, 1])),
      new AtomicTimetag(new Timetag(SECONDS_70_YEARS + 123, 3312123)),
    ]
  })

  describe('unpack', () => {
    it('exists', () => {
      atomicChildren.forEach((atomicItem: any) => {
        expect(atomicItem).to.have.property('unpack')
      })
    })
  })

  describe('pack', () => {
    it('returns a multiple of 32', () => {
      atomicChildren.forEach((atomicItem: { pack: Function }) => {
        expect((atomicItem.pack().byteLength * 8) % 32).to.equal(0)
      })
    })

    it('returns an object of type Uint8Array', () => {
      atomicChildren.forEach((atomicItem: { pack: Function }) => {
        expect(atomicItem.pack()).to.be.a('uint8Array')
      })
    })
  })
})
