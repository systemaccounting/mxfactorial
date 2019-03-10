ENV=$1
CURRENT_DIR=$(pwd)
for dir in */; do
  cd $CURRENT_DIR/$dir && yarn run deploy:$ENV
done

# cherry-pick by commenting lines 3-5 above when commenting below in
# DEPLOYING=$'rules-faas/\ntransact-faas/'
# for dir in $DEPLOYING; do
#   cd $CURRENT_DIR/$dir && yarn run deploy:$ENV
# done