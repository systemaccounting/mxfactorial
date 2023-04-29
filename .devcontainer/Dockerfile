FROM mcr.microsoft.com/devcontainers/universal:2

ARG TF_VERSION=1.2.7

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
	npm install -g eslint && \
	sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' && \
	wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add - && \
	sudo apt-get update && \
	sudo apt-get install --yes --no-install-recommends \
	postgresql-client && \
	curl -LO https://github.com/golang-migrate/migrate/releases/download/v4.15.2/migrate.linux-amd64.deb && \
	sudo dpkg -i migrate.linux-amd64.deb && \
	rm migrate.linux-amd64.deb