from main import *
import pytest
from botocore.stub import Stubber
# boto3 stubbing used for testing functions calling boto3 methods:
# https://botocore.amazonaws.com/v1/documentation/api/latest/reference/stubber.html


@pytest.mark.it('returns current s3 event configuration')
def test_get_notifications(initial_test_configurations):
  test_input_configs = {'LambdaFunctionConfigurations': [*initial_test_configurations]}
  sorted_expected = json.dumps(
    {
      'LambdaFunctionConfigurations': [*initial_test_configurations]
    },
    sort_keys=True
  )
  stub = Stubber(s3)
  MOCK_ARTIFACT_BUCKET = "some-artifact-dev"
  expected_params = { 'Bucket': MOCK_ARTIFACT_BUCKET }
  mock_lambda_config_list = stub.add_response(
    method='get_bucket_notification_configuration',
    service_response=test_input_configs,
    expected_params=expected_params
  )
  stub.activate()
  res = get_notifications(MOCK_ARTIFACT_BUCKET)
  stub.deactivate()
  sorted_res = json.dumps(res, sort_keys=True)
  assert sorted_res == sorted_expected


@pytest.mark.it('adds lambda event config')
def test_add_lambda_notification(initial_test_configurations, additional_test_configuration):
  test_input_configs = {'LambdaFunctionConfigurations': [*initial_test_configurations]}
  sorted_expected = json.dumps(
    { 'LambdaFunctionConfigurations': [
        *initial_test_configurations,
        additional_test_configuration
      ]
    },
    sort_keys=True
  )
  res = add_lambda_notification(
    test_input_configs,
    'third-src.zip',
    'third-resource-dev',
    '012345678910'
  )
  sorted_res = json.dumps(res, sort_keys=True)
  assert sorted_res == sorted_expected


@pytest.mark.it('duplicate lambda event config NOT added')
def test_add_lambda_notification2(initial_test_configurations, additional_test_configuration):
  test_input_configs = {'LambdaFunctionConfigurations': [*initial_test_configurations]}
  sorted_expected = json.dumps(
    { 'LambdaFunctionConfigurations': [
        *initial_test_configurations
      ]
    },
    sort_keys=True
  )
  res = add_lambda_notification(
    test_input_configs,
    'second-src.zip',
    'second-resource-dev',
    '012345678910'
  )
  sorted_res = json.dumps(res, sort_keys=True)
  assert sorted_res == sorted_expected


@pytest.mark.it('removes lambda event config')
def test_delete_lambda_notification(initial_test_configurations):
  test_input_configs = {'LambdaFunctionConfigurations': [*initial_test_configurations]}
  after_deleted = delete_lambda_notification(
    test_input_configs,
    'second-src.zip',
    'second-resource-dev'
  )
  assert len(after_deleted['LambdaFunctionConfigurations']) == 1


@pytest.mark.it('does NOT delete config if object_name NOT intended for resource')
def test_delete_lambda_notification2(initial_test_configurations):
  test_input_configs = {'LambdaFunctionConfigurations': [*initial_test_configurations]}
  after_deleted = delete_lambda_notification(
    test_input_configs,
    'second-src.zip',
    'other-resource-dev'
  )
  assert len(after_deleted['LambdaFunctionConfigurations']) == 2
