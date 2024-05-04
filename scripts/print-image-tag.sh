#/bin/bash

if [[ "$#" -ne 6 ]] && [[ "$#" -ne 8 ]]; then
	cat <<-'EOF'
		use:
		bash scripts/print-image-tag.sh --app-name rule --env dev --env-id 12345 # OPTIONAL: --hash 12345678
	EOF
	exit 1
fi

while [[ "$#" -gt 0 ]]; do
	case $1 in
	--app-name)
		APP_NAME="$2"
		shift
		;;
	--env)
		ENV="$2"
		shift
		;;
	--env-id)
		ENV_ID="$2"
		shift
		;;
	--hash)
		HASH="$2"
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
SHORT_GIT_SHA_LENGTH=$(yq '.scripts.env_var.set.SHORT_GIT_SHA_LENGTH.default' $PROJECT_CONF)

if [[ -z $HASH ]]; then
	HASH=$(git rev-parse --short=$SHORT_GIT_SHA_LENGTH HEAD)
fi

REPO=$(source scripts/print-ecr-repo-uri.sh --app-name $APP_NAME --env $ENV --env-id $ENV_ID)
echo "$REPO:$HASH"
