const AWS = require('aws-sdk');
const req = require('./utils/testRequest.json');
const res = require('./utils/testResponse.json');
const { invokeLambda } = require('./utils/integrationTestHelpers');

const lambda = new AWS.Lambda({
  apiVersion: '2015-03-31',
  region: process.env.AWS_REGION,
});

// todo: increase coverage
describe('lambda integration', () => {
  test('returns rule added transaction items & approvers', async () => {
    const got = await invokeLambda(lambda, req);
    expect(got).toEqual(res);
  });
});