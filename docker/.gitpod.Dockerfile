FROM gitpod/workspace-full:latest

ARG TF_VERSION=1.2.7
ARG CUE_VERSION=0.11.1

RUN bash -lc "rustup default stable" && \
	wget -O- https://carvel.dev/install.sh > install.sh && \
	sudo bash install.sh && \
	rm install.sh && \
	go install github.com/mikefarah/yq/v4@latest && \
	sudo apt-get install bc -y && \
	sudo apt-get clean && \
	curl -fSsl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
	unzip -qq awscliv2.zip && \
	sudo ./aws/install --update && \
	rm awscliv2.zip && \
	wget https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_linux_amd64.zip && \
	unzip terraform_${TF_VERSION}_linux_amd64.zip && \
	sudo mv terraform /usr/local/bin && \
	rm terraform_${TF_VERSION}_linux_amd64.zip && \
	wget https://github.com/cue-lang/cue/releases/download/v${CUE_VERSION}/cue_v${CUE_VERSION}_linux_amd64.tar.gz && \
	tar -xf cue_v${CUE_VERSION}_linux_amd64.tar.gz && \
	sudo mv cue /usr/local/bin && \
	rm -rf cue_v${CUE_VERSION}_linux_amd64.tar.gz && \
	rustup component add llvm-tools-preview --toolchain stable-x86_64-unknown-linux-gnu && \
	cargo install cargo-llvm-cov && \
	brew install libpq && \
	brew link --force libpq && \
	brew install golang-migrate && \
	npm install -g eslint && \
	npx playwright install-deps && \
	(cd client; npx playwright install)