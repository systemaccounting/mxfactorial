CURRENT_DIR=$(pwd)
for dir in */; do
  cd $CURRENT_DIR/$dir && . build.sh
done

# DEPLOYING=$'rules-faas/\ntransact-faas/\ngraphql-faas/'
# for dir in $DEPLOYING; do
#   cd $CURRENT_DIR/$dir && . build.sh
# done