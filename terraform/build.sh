#!/bin/bash

# build all artifacts before terraform apply
(cd ../schema/clone-faas; . build.sh all)
(cd ../schema/update-faas; . build.sh all)
(cd ../services; . build.sh all)
(cd ./environments/common-bin/cognito/auto-confirm; . build.sh)
(cd ./environments/common-bin/cognito/delete-faker-accounts; . build.sh)
(cd ./environments/common-bin/rds; . build.sh)