import { describe, expect, it } from 'vitest'
import { isNull, isUndefined, pad } from '../../src/common/utils'

describe('pad', () => {
  it('returns the next multiple of 4', () => {
    expect(pad(2)).to.be.equals(4)
    expect(pad(8)).to.be.equals(8)
    expect(pad(31)).to.be.equals(32)
    expect(pad(0)).to.be.equals(0)
  })
})

describe('isNull', () => {
  it('correctly identifies null value', () => {
    expect(isNull(0)).to.be.false
    expect(isNull(undefined)).to.be.false
    expect(isNull(null)).to.be.true
  })
})

describe('isUndefined', () => {
  it('correctly identifies undefined value', () => {
    expect(isUndefined(0)).to.be.false
    expect(isUndefined(undefined)).to.be.true
    expect(isUndefined(null)).to.be.false
  })
})
