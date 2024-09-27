#!/bin/bash

set -e

if [[ "$#" -ne 6 ]]; then
	echo "use: bash scripts/get-ssh-key.sh --env dev --ssm-suffix ops/ec2/microk8s/ssh/priv_key --dir /Users/$(whoami)/code/mxfactorial/k8s"
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--env)
		ENV="$2"
		shift
		;;
	--ssm-suffix)
		SSM_SUFFIX="$2"
		shift
		;;
	--dir)
		DIR="$2"
		shift
		;;
	*)
		echo "unknown parameter passed: $1"
		exit 1
		;;
	esac
	shift
done

PROJECT_CONF=project.yaml
ENV_ID=$(source scripts/print-env-id.sh)
ID_ENV="$ENV_ID-$ENV"
SSM_VERSION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.SSM_VERSION.default' $PROJECT_CONF)
REGION=$(yq '.infra.terraform.aws.modules.environment.env_var.set.REGION.default' $PROJECT_CONF)
KEY_PATH="$DIR/$ID_ENV.pem"

if [[ -f $KEY_PATH ]]; then
	rm -f $KEY_PATH
fi

aws ssm get-parameter \
	--name "/$ENV_ID/$SSM_VERSION/$ENV/$SSM_SUFFIX" \
	--query 'Parameter.Value' \
	--region $REGION \
	--with-decryption \
	--output text >$KEY_PATH

chmod 400 $KEY_PATH