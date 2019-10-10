const getPools = async (service) => {

  let cognitoPools = []
  let nextPage

  let params = {
    MaxResults: '25',
  }
  let initialReponse = await service.listUserPools(params).promise()

  cognitoPools.push(...initialReponse.UserPools)

  if (initialReponse.NextToken) {
    nextPage = initialReponse.NextToken
  }

  while(nextPage) {
    try {
      let remainingParams = {
        MaxResults: '25',
        NextToken: nextPage
      }
      let remainingResponse = await service.listUserPools(remainingParams).promise()
      console.log(remainingResponse)
      cognitoPools.push(...remainingResponse.UserPools)
      if (remainingResponse.NextToken) {
        nextPage = remainingResponse.NextToken
      } else {
        nextPage = false
      }
    } catch(err) {
      console.log(err)
    }
  }

  return cognitoPools
}

const filterCurrentCognitoPoolId = (pools, currentPoolName) => {
  let filteredPoolId = pools.filter(obj => {
    return obj.Name == currentPoolName
  })
  if (filteredPoolId.length < 1) {
    console.log('0 user pools matched. exiting')
    throw new Error('0 user pools matched')
  }
  if (filteredPoolId.length > 1) {
    console.log('duplicate pools matched. exiting')
    throw new Error('duplicate pools matched')
  }
  let currentCognitoPoolId = filteredPoolId[0].Id
  return currentCognitoPoolId
}

const getCognitoJsonWebKeys = async (axiosService, region, poolId) => {
  let url = `https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`
  let pullJwks = await axiosService.get(url)
  let cognitoJsonWebKeys = pullJwks.data.keys
  return cognitoJsonWebKeys
}

const matchCognitoWebKey = (keys, claimedKeyId) => {
  let matchedCognitoKey = []
  for (key of keys) {
    if (claimedKeyId == key.kid) {
      matchedCognitoKey.push(key)
    }
  }

  if (matchedCognitoKey.length < 1) {
    console.log('0 claimed cognito keys matched. exiting')
    throw new Error('0 claimed cognito keys matched')
  }

  if (matchedCognitoKey.length > 1) {
    console.log('duplicate claimed cognito keys matched.')
    // todo: alert event
  }

  let matchedCognitoWebKey = matchedCognitoKey[0]
  return matchedCognitoWebKey
}

module.exports = {
  getPools,
  filterCurrentCognitoPoolId,
  getCognitoJsonWebKeys,
  matchCognitoWebKey
}