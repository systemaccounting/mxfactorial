<p align="center">
  <a href="http://www.systemaccounting.org/math_identity" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

## example per environment cloudformation use

aws resources not available in terraform provisioned through cloudformation
dependencies: aws cli, credentials

1. [create](https://docs.aws.amazon.com/cli/latest/reference/s3api/create-bucket.html) standalone `$APP-artifacts-$ENV` bucket to store and deploy artifacts 
1. `make initial-deploy ENV=dev` to deploy artifacts to bucket
1. author template, e.g. `websockets.yaml`
1. prepare inline variable assignments for reusable cloudformation commands: `STACK=notification-websockets ENV=dev`
1. [display](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/list-stacks.html) current stacks: `aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE`
1. [test template](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/validate-template.html): `aws cloudformation validate-template --template-body file://$(pwd)/websockets.yaml`
1. [create](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/create-stack.html) stack:
    ```bash
    STACK=notification-websockets ENV=dev; \
    aws cloudformation create-stack \
      --timeout-in-minutes 5 \
      --capabilities CAPABILITY_NAMED_IAM \
      --stack-name $STACK-$ENV \
      --template-body file://$(pwd)/websockets.yaml \
      --parameters ParameterKey=Environment,ParameterValue=$ENV
    ```
1. [get](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/get-template.html) current template: `STACK=notification-websockets ENV=dev; aws cloudformation get-template --stack-name $STACK-$ENV`
1. [create template change set](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/create-change-set.html):
    ```bash
    export CHANGE_SET_ID=$(\
      STACK=notification-websockets ENV=dev UTC_TIME=$(date -u '+%Y-%m-%d-%H-%M-%S'); \
      aws cloudformation create-change-set \
        --capabilities CAPABILITY_NAMED_IAM \
        --stack-name $STACK-$ENV \
        --change-set-name $STACK-$ENV-$UTC_TIME \
        --template-body file://$(pwd)/websockets.yaml \
        --parameters ParameterKey=Environment,ParameterValue=$ENV \
        --query Id --output text \
    )
    ```
    **OR** skip next 2 steps to [update](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/create-change-set.html) stack **WITHOUT** first creating change set:
    ```bash
    STACK=notification-websockets ENV=dev; \
    aws cloudformation update-stack \
    --capabilities CAPABILITY_NAMED_IAM \
    --stack-name $STACK-$ENV \
    --template-body file://$(pwd)/websockets.yaml \
    --parameters ParameterKey=Environment,ParameterValue=$ENV
    ```
1. [describe intended stack change](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/describe-change-set.html) by passing exported `CHANGE_SET_ID` variable from previous step (**OR** visit cloudformation in aws console): `aws cloudformation describe-change-set --change-set-name $CHANGE_SET_ID`
1. [execute](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/execute-change-set.html) change set by passing exported `CHANGE_SET_ID` variable from previous 'create template change set' step: `aws cloudformation execute-change-set --change-set-name $CHANGE_SET_ID`
1. [describe stack outputs](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/describe-stacks.html) to access values required by application:
    ```bash
    STACK=notification-websockets ENV=dev; \
    aws cloudformation describe-stacks --stack-name $STACK-$ENV \
      --query 'Stacks[?StackName==`'$STACK-$ENV'`].Outputs'
    ```
1. document new `template.yaml: $STACK-$ENV` managed by cloudformation in section below  
1. [detect drift](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/detect-stack-drift.html) IF non-cloudformation change expected in stack: `STACK=notification-websockets ENV=dev; aws cloudformation detect-stack-drift --stack-name $STACK-$ENV`  
1. [delete](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/delete-stack.html) stack: `STACK=notification-websockets ENV=dev; aws cloudformation delete-stack --stack-name $STACK-$ENV`

## current stacks
1. `websockets.yaml: notification-websockets-dev`
1. `websockets.yaml: notification-websockets-prod`