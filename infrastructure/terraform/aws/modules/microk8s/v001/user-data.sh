#!/bin/bash
sudo apt update
sudo snap install microk8s --classic --channel=1.31
sudo microk8s enable dns ingress
sudo usermod -a -G microk8s ubuntu
mkdir -p /home/ubuntu/.kube
sudo chown -f -R ubuntu /home/ubuntu/.kube
chmod 0700 /home/ubuntu/.kube
wget -O- https://carvel.dev/install.sh >install.sh
sudo bash install.sh
rm install.sh