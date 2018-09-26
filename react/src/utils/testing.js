export const promiseToResolve = payload => () =>
  new Promise((resolve, _) => {
    resolve(payload)
  })

export const promiseToReject = payload => () =>
  new Promise((_, reject) => {
    reject(payload)
  })
