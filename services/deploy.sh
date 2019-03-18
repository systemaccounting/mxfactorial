ENV=$1
CURRENT_DIR=$(pwd)
for dir in */; do
  cd $CURRENT_DIR/$dir && . deploy.sh $ENV
done

# cherry-pick by commenting lines 3-5 above, then commenting below in
# DEPLOYING=$'rules-faas/\ntransact-faas/\ngraphql-faas/'
# for dir in $DEPLOYING; do
#   cd $CURRENT_DIR/$dir && . deploy.sh $ENV
# done