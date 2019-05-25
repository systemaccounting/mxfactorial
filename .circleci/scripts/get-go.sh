#!/bin/bash
sudo curl -fsS -O https://dl.google.com/go/go1.12.5.linux-amd64.tar.gz
sudo tar -xvf go1.12.5.linux-amd64.tar.gz
sudo chown -R root:root ./go
sudo mv ./go /usr/local
echo 'export GOPATH=$HOME/go' >> $BASH_ENV
mkdir -p $HOME/go/bin
echo 'export GOBIN=$GOPATH/bin' >> $BASH_ENV
echo 'export PATH=/usr/local/go/bin:$PATH' >> $BASH_ENV