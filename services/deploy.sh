CURRENT_DIR=$(pwd)
for dir in */; do
  cd $CURRENT_DIR/$dir && yarn run deploy:$1
done