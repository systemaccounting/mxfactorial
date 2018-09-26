import { noop, asyncPipe } from '../index'

describe('noop()', () => {
  it('returns nothing, does nothing', () => {
    expect(noop()).toEqual(undefined)
  })
})

describe('asyncPipe()', () => {
  it('runs promises concurrently', () => {
    const promise1 = () => Promise.resolve(1)
    const promise2 = () => Promise.resolve(2)
    expect(asyncPipe(promise1, promise2)).toBeTruthy()
  })
  it('runs single promise', () => {
    const promise1 = () => Promise.resolve(1)
    expect(asyncPipe('x', promise1)).toBeTruthy()
  })
})
