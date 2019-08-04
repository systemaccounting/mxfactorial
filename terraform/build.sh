#!/bin/bash

# build all artifacts before terraform apply
(cd ../schema/clone-faas; . build.sh all)
(cd ../schema/update-faas; . build.sh all)
(cd ../services; . build.sh all)
(cd ./aws/modules/environment/common-bin/cognito/auto-confirm; . build.sh)
(cd ./aws/modules/environment/common-bin/cognito/delete-faker-accounts; . build.sh)
(cd ./aws/modules/environment/common-bin/rds; . build.sh)