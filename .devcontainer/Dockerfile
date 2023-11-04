FROM mcr.microsoft.com/devcontainers/universal:2

ARG TF_VERSION=1.2.7
ARG MIGRATE_VERSION=4.15.2
ARG WATCH_VERSION=8.4.0
ARG CARGO_LLVM_COV_VERSION=0.5.36

RUN go install github.com/99designs/gqlgen@latest && \
	go install github.com/golang/mock/mockgen@latest && \
	go install github.com/mikefarah/yq/v4@latest && \
	chmod -R a+w /go/pkg && \
	curl -fSsl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
	unzip -qq awscliv2.zip && \
	sudo ./aws/install --update && \
	rm awscliv2.zip && \
	wget https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_linux_amd64.zip &&\
	unzip terraform_${TF_VERSION}_linux_amd64.zip && \
	sudo mv terraform /usr/local/bin && \
	rm terraform_${TF_VERSION}_linux_amd64.zip && \
	wget https://github.com/watchexec/cargo-watch/releases/download/v${WATCH_VERSION}/cargo-watch-v${WATCH_VERSION}-x86_64-unknown-linux-gnu.tar.xz && \
	tar -xf cargo-watch-v${WATCH_VERSION}-x86_64-unknown-linux-gnu.tar.xz && \
	sudo mv cargo-watch-v${WATCH_VERSION}-x86_64-unknown-linux-gnu/cargo-watch /usr/local/bin && \
	rm -rf cargo-watch-v${WATCH_VERSION}-x86_64-unknown-linux-gnu* && \
	wget https://github.com/taiki-e/cargo-llvm-cov/releases/download/v${CARGO_LLVM_COV_VERSION}/cargo-llvm-cov-aarch64-unknown-linux-gnu.tar.gz && \
	tar -xf cargo-llvm-cov-aarch64-unknown-linux-gnu.tar.gz && \
	sudo mv cargo-llvm-cov /usr/local/bin && \
	rm -rf cargo-llvm-cov* && \
	npm install -g eslint && \
	sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' && \
	wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add - && \
	sudo apt-get update && \
	sudo apt-get install --yes --no-install-recommends \
	postgresql-client && \
	curl -LO https://github.com/golang-migrate/migrate/releases/download/v${MIGRATE_VERSION}/migrate.linux-amd64.deb && \
	sudo dpkg -i migrate.linux-amd64.deb && \
	rm migrate.linux-amd64.deb