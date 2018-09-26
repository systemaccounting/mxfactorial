export const noop = () => {}

export const asyncPipe = (...promises) =>
  promises.reduce(async (acc, current) => {
    if (typeof acc === 'function') {
      return acc().then(current)
    }
    return await current()
  })
