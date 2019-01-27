#!/bin/bash

# get last successful build number of branch
echo "Current CircleCI job: $CIRCLE_JOB"
set +e
LAST_SUCCESSFUL_BUILD_NUMBER=$(curl -s https://circleci.com/api/v1.1/project/github/systemaccounting/mxfactorial/tree/${CIRCLE_BRANCH}?circle-token=${CI_API_TOKEN} | \
jq -r 'map(select(.workflows.job_name == '\"$CIRCLE_JOB\"' and .outcome == "success")) | first.build_num')
echo "Last successful build: $LAST_SUCCESSFUL_BUILD_NUMBER"
if [[ $LAST_SUCCESSFUL_BUILD_NUMBER == "null" ]]; then
  # get initial commit after branching from develop or master if no previous successful build number
  if [[ $CIRCLE_BRANCH != "develop" && $CIRCLE_BRANCH != "master" ]]; then
    PARENT_BRANCH=$(git show-branch | grep -F '*' | grep -v "$(git rev-parse --abbrev-ref HEAD)" | head -n1 | sed 's/.*\[\(.*\)\].*/\1/' | sed 's/[\^~].*//')
    CURRENT_BRANCH=$(git branch | grep -F '*' | cut -d ' ' -f2)
    SUBDIR=git log --name-only --oneline $PARENT_BRANCH..$CURRENT_BRANCH | sed -E '/^[a-f0-9]{7}/d' | grep '/' | cut -d "/" -f1 | sed '/^\.circleci$/d' | sort -u
  else
    # use previous commit sha if develop or master and no previous success build number (in case someone git inits this script)
    SUBDIR=$(git log --name-only --oneline -1 | sed -E '/^[a-f0-9]{7}/d' | grep '/' | cut -d "/" -f1 | sed '/^\.circleci$/d' | sort -u)
  fi
  # exit if react project excluded from subdirectories affected by latest commit
  echo "Directories affected when no previous successful build available: $SUBDIR"
  if [[ "$SUBDIR" != *"$1"* ]]; then
    circleci step halt
  fi
fi
# get commit sha of last successful build number on branch
LAST_SUCCESSFUL_BUILD_COMMIT=$(curl -s https://circleci.com/api/v1.1/project/github/systemaccounting/mxfactorial/$LAST_SUCCESSFUL_BUILD_NUMBER?circle-token=$CI_API_TOKEN | \
jq -r '.all_commit_details | first | .commit')
echo "Last successful build commit: $LAST_SUCCESSFUL_BUILD_COMMIT"
# get subdirectories affected by range of commits since last successful build
SUBDIR=$(git log --name-only --oneline $LAST_SUCCESSFUL_BUILD_COMMIT..$CIRCLE_SHA1 | sed -E '/^[a-f0-9]{7}/d' | grep '/' | cut -d "/" -f1 | sed '/^\.circleci$/d' | sort -u)
echo "Directories affected since previous successful build of $CIRCLE_JOB job: $SUBDIR"
# exit if react project excluded from list of subdirectories affected by range of commits since last successful build
if [[ "$SUBDIR" != *"$1"* ]]; then
  circleci step halt
fi