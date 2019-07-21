# usage:
# 1. docker build -t mxfactorial/circleci:v1 .
# 2. docker push mxfactorial/circleci:v1
# 3. ref in config.yml image property
FROM circleci/node:11.3.0-browsers
RUN sudo apt-get update -y \
  && sudo apt-get upgrade -y \
  && sudo apt-get install -yq python3 python3-pip jq --fix-missing \
  && pip3 install awscli --upgrade --user \
  && sudo cp -rf $HOME/.local/bin/* /usr/local/bin \
  && sudo curl -fsS -O https://dl.google.com/go/go1.12.5.linux-amd64.tar.gz \
  && sudo tar -xvf go1.12.5.linux-amd64.tar.gz \
  && sudo chown -R root:root ./go \
  && sudo mv ./go /usr/local \
  && mkdir -p $HOME/go/bin
# inherit entrypoint
