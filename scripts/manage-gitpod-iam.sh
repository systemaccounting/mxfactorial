#!/bin/bash

if [[ "$#" -ne 1 ]]; then
	echo "use: bash scripts/manage-gitpod-iam.sh --new # OR --delete"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --new) NEW=1;;
        --delete) DELETE=1;;
        *) echo "unknown parameter passed: $1"; exit 1 ;;
    esac
	shift
done

PROJECT_CONF=project.yaml
REGION=$(yq '.infrastructure.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
IAM_USER=$(yq '.scripts.env_var.set.IAM_USER.default' $PROJECT_CONF)
USER_POLICY_ARN=$(yq '.scripts.env_var.set.USER_POLICY_ARN.default' $PROJECT_CONF)

function new() {
    echo "creating $IAM_USER iam user with $USER_POLICY_ARN policy and access key"
    aws iam create-user --user-name "$IAM_USER" --region "$REGION"

    aws iam attach-user-policy --user-name "$IAM_USER" --policy-arn "$USER_POLICY_ARN" --region "$REGION"

    ACCESS_KEY=$(aws iam create-access-key --user-name "$IAM_USER" --query 'AccessKey' --region "$REGION")

    echo "AWS Access Key ID: $(echo $ACCESS_KEY | yq -I0 .AccessKeyId)"
    echo "AWS Secret Access Key: $(echo $ACCESS_KEY | yq -I0 .SecretAccessKey)"
}

function delete() {
    KEY_IDS=($(aws iam list-access-keys --user-name "$IAM_USER" --region "$REGION" --query 'AccessKeyMetadata[*].[AccessKeyId]' --output text))

    for keyid in "${KEY_IDS[@]}"; do
        echo "deleting access key id: $keyid"
        aws iam delete-access-key --access-key-id "$keyid" --user-name "$IAM_USER" --region "$REGION"
    done

    echo "detaching $USER_POLICY_ARN from user: $IAM_USER"
    aws iam detach-user-policy --user-name "$IAM_USER" --policy-arn "$USER_POLICY_ARN" --region "$REGION"

    echo "deleting iam user: $IAM_USER"
    aws iam delete-user --user-name "$IAM_USER" --region "$REGION"
}


if [[ "$NEW" -eq 1 ]]; then
    # test for current user
    USER_COUNT=$(aws iam list-users --region "$REGION" --query "Users[?UserName==\`$IAM_USER\`]" | yq 'length')

    # delete current user
    if [[ "$USER_COUNT" -gt 0 ]]; then
        delete
        echo ""
    fi

    # create new user
    new
fi

if [[ "$DELETE" -eq 1 ]]; then
    delete
fi