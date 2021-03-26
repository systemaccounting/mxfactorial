DIR := ${CURDIR}
APP_NAME = go-migrate
ARTIFACT_NAME = $(APP_NAME)-src.zip
LAMBDA_NAME = $(APP_NAME)-faas
ARTIFACT_BUCKET = mxfactorial-artifacts
REGION = us-east-1
TMP_MIGRATE_REPO_DIR=./build
MIGRATE_BINARY_NAME=migrate.linux-amd64
MIGRATE_BINARY_ARTIFACT=$(MIGRATE_BINARY_NAME).zip
# from https://github.com/golang-migrate/migrate/blob/master/Makefile to avoid building for every os
DATABASE ?= postgres mysql redshift cassandra spanner cockroachdb clickhouse mongodb sqlserver firebird neo4j pgx
DATABASE_TEST ?= $(DATABASE) sqlite sqlcipher
VERSION ?= $(shell git describe --tags 2>/dev/null | cut -c 2-)
test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

###################### clean ######################

clean:
	rm -f $(ARTIFACT_NAME) $(MIGRATE_BINARY_NAME) $(INVOKE_LOGFILE)
	rm -rf $(TMP_MIGRATE_REPO_DIR)

zip: clean build
	zip -r $(ARTIFACT_NAME) index.sh $(MIGRATE_BINARY_NAME)

###################### secrets ######################

get-secrets: retrieve-each-secret
	@if [ ! -s $(DIR)/.env ]; then \
		rm $(DIR)/.env; \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	@if [ $@ = AWS_REGION ]; then \
		echo AWS_REGION=$(REGION) >> $(DIR)/.env; \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
			echo $@=$$ENV_VAR \
			>> $(DIR)/.env; \
	fi

###################### build ######################

.PHONY: build
build:
	rm -f $(MIGRATE_BINARY_NAME)
	rm -rf $(TMP_MIGRATE_REPO_DIR)
	git clone --depth 1 --single-branch --branch master https://github.com/golang-migrate/migrate.git $(TMP_MIGRATE_REPO_DIR)
	-mkdir $(TMP_MIGRATE_REPO_DIR)/cli/build
	(cd $(TMP_MIGRATE_REPO_DIR)/cmd/migrate && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o ../../cli/build/$(MIGRATE_BINARY_NAME) -ldflags='-X main.Version=$(VERSION) -extldflags "-static"' -tags '$(DATABASE) $(SOURCE)' .)
	mv $(TMP_MIGRATE_REPO_DIR)/cli/build/$(MIGRATE_BINARY_NAME) ./$(MIGRATE_BINARY_NAME) 2>/dev/null

# aliases zip target
src: zip

###################### deploy ######################

deploy: zip deploy-only

put-object:
	@$(MAKE) -s test-env-arg
	@ETAG=$$(aws s3api put-object \
		--bucket=$(ARTIFACT_BUCKET)-$(ENV) \
		--key=$(ARTIFACT_NAME) \
		--body=$(DIR)/$(ARTIFACT_NAME) \
		--region=$(REGION) \
		--output=text | sed 's/"//g'); \
	echo "***pushed $(ARTIFACT_NAME) artifact with ETag: $$ETAG"

update-function:
	@$(MAKE) -s test-env-arg
	@MOD=$$(aws lambda update-function-code \
		--function-name=$(LAMBDA_NAME)-$(ENV) \
		--s3-key=$(ARTIFACT_NAME) \
		--s3-bucket=$(ARTIFACT_BUCKET)-$(ENV) \
		--region=$(REGION) \
		--query 'LastModified' | xargs);\
	echo "***$(LAMBDA_NAME)-$(ENV) lambda deployed @ $$MOD"

deploy-only:
		$(MAKE) put-object ENV=$(ENV)
		$(MAKE) update-function ENV=$(ENV)

deploy-all: deploy

initial-deploy: test-env-arg deploy