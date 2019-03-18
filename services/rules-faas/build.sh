build_src() {
  rm -f rules-lambda.zip
  yarn install
  zip -r rules-lambda.zip index.js src node_modules package.json yarn.lock
}

build_src