FROM gitpod/workspace-full:latest

ARG TF_VERSION=1.2.7

RUN bash -lc "rustup default stable" && \
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
	rustup component add llvm-tools-preview --toolchain stable-x86_64-unknown-linux-gnu && \
	cargo install cargo-llvm-cov && \
	brew install libpq && \
	brew link --force libpq && \
	brew install golang-migrate && \
	npm install -g eslint && \
	npx playwright install-deps && \
	(cd client; npx playwright install)