build_src() {
  rm -f transact-lambda.zip
  yarn install
  zip -r transact-lambda.zip index.js src node_modules package.json yarn.lock
}

build_src