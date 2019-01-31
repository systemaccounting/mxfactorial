export const noop = () => {}

export const asyncPipe = (...promises) =>
  promises.reduce(async (acc, current) => {
    if (typeof acc === 'function') {
      return acc().then(current)
    }
    return await current()
  })

export const getTestVars = () =>
  Object.keys(process.env).filter(key =>
    process.env[key] ? /REACT_APP_TEST/.test(key) : false
  )
