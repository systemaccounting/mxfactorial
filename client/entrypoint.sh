#!/bin/sh

set -e

# recursively replace all default GRAPHQL_URI Dockerfile
# assignments in the /usr/share/nginx/html directory with
# the value of the GRAPHQL_URI environment variable
find /usr/share/nginx/html -type f -exec sed -i "s/aHR0cDovL2xvY2FsaG9zdDoxMDAwMAo=/$GRAPHQL_URI/g" {} \;
exec "$@"