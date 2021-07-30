POSTGRESQL_USERNAME=test
POSTGRESQL_PASSWORD=test
POSTGRESQL_HOST=localhost
POSTGRESQL_PORT=5432
POSTGRESQL_DATABASE=mxfactorial
HOST_PORT=$(POSTGRESQL_PORT)
CONTAINER_PORT=$(POSTGRESQL_PORT)
DATABASE_TYPE=postgres
APP=mxfactorial
CONTAINER_NAME=$(APP)-postgres
POSTGRES_VOLUME_MOUNT_PATH=$(CURDIR)/postgres-data
CONTAINER_POSTGRES_STORAGE_PATH=/bitnami/postgresql
DOCKER_IMAGE=bitnami/postgresql
IMAGE_VERSION=latest

ENV_FILE=$(CURDIR)/.env
ENV_VARS=DATABASE_TYPE \
PGUSER \
PGPASSWORD \
PGHOST \
PGPORT \
PGDATABASE

DOCKER_POSTGRES=$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=migration_$(DIR)_version
MIGRATIONS_DIR=$(CURDIR)/$(DIR)

# migration lambda vars
MIGRATION_LAMBDA_NAME=go-migrate-faas-$(ENV)
REGION=us-east-1

# case intended, values matched from make cli args
prod_up = schema seed
prod_down = seed schema
test_up = $(prod_up) testseed
test_down = testseed $(prod_down)

# postgres docker
run:
	docker run \
	--rm \
	--name $(CONTAINER_NAME) \
	-e POSTGRESQL_USERNAME=$(POSTGRESQL_USERNAME) \
	-e POSTGRESQL_PASSWORD=$(POSTGRESQL_PASSWORD) \
	-e POSTGRESQL_DATABASE=$(POSTGRESQL_DATABASE) \
	-p $(HOST_PORT):$(CONTAINER_PORT) \
	-v $(POSTGRES_VOLUME_MOUNT_PATH):$(CONTAINER_POSTGRES_STORAGE_PATH) \
	$(DOCKER_IMAGE):$(IMAGE_VERSION)

stop:
	docker stop $(CONTAINER_NAME)

clean:
	-@$(MAKE) stop
	rm -rf $(POSTGRES_VOLUME_MOUNT_PATH)

redocker:
	-@$(MAKE) clean
	$(MAKE) run

# looped go migrate targets for docker postgres
resetdocker:
	$(MAKE) dropdocker DB=test
	$(MAKE) updocker DB=test

testdocker:
	$(MAKE) resetdocker
	$(MAKE) downdocker DB=test

updocker:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(foreach DIR,$($(DB)_up), migrate -verbose -path ./$(DIR) -database "$(DOCKER_POSTGRES)" up;)

downdocker:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(foreach DIR,$($(DB)_down), migrate -verbose -path ./$(DIR) -database "$(DOCKER_POSTGRES)" down --all;)

dropdocker:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(foreach DIR,$($(DB)_down), migrate -verbose -path ./$(DIR) -database "$(DOCKER_POSTGRES)" drop -f;)

# looped go migrate targets for rds postgres
resetrds:
	$(MAKE) droprds DB=test
	$(MAKE) uprds DB=test

testrds:
	$(MAKE) resetrds
	$(MAKE) downrds DB=test

uprds:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(MAKE) get-secrets
	$(foreach DIR,$($(DB)_up), eval $$(cat $(ENV_FILE)); migrate -verbose -path ./$(DIR) -database "$$DATABASE_TYPE://$$PGUSER:$$PGPASSWORD@$$PGHOST:$$PGPORT/$$PGDATABASE?sslmode=disable&x-migrations-table=migration_$(DIR)_version" up;)

downrds:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(MAKE) get-secrets
	$(foreach DIR,$($(DB)_down), eval $$(cat $(ENV_FILE)); migrate -verbose -path ./$(DIR) -database "$$DATABASE_TYPE://$$PGUSER:$$PGPASSWORD@$$PGHOST:$$PGPORT/$$PGDATABASE?sslmode=disable&x-migrations-table=migration_$(DIR)_version" down --all;)

droprds:
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(MAKE) get-secrets
	$(foreach DIR,$($(DB)_down), eval $$(cat $(ENV_FILE)); migrate -verbose -path ./$(DIR) -database "$$DATABASE_TYPE://$$PGUSER:$$PGPASSWORD@$$PGHOST:$$PGPORT/$$PGDATABASE?sslmode=disable&x-migrations-table=migration_$(DIR)_version" drop -f;)

# local go migrate
init:
	@$(MAKE) -s test-dir-arg
	migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq init_schema

create:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-name-arg
	migrate -verbose create -ext sql -dir $(MIGRATIONS_DIR) -seq $(NAME)

updir:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-count-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(DOCKER_POSTGRES)" up $(COUNT)

downdir:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-count-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(DOCKER_POSTGRES)" down $(COUNT)

updirall:
	@$(MAKE) -s test-dir-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(DOCKER_POSTGRES)" up

downdirall:
	@$(MAKE) -s test-dir-arg
	yes | migrate -verbose -path $(MIGRATIONS_DIR) -database "$(DOCKER_POSTGRES)" down

dropdir:
	@$(MAKE) -s test-dir-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(DOCKER_POSTGRES)" drop -f

force:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-version-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(DOCKER_POSTGRES)" force $(VERSION)

clear:
	$(MAKE) drop

# lambda
# e.g. make deploy-migrations ENV=dev DIR=migrations BRANCH=199/db-item-transaction CMD=up COUNT=all
deploy-migrations:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-branch-arg
	@$(MAKE) -s test-cmd-arg
	@$(MAKE) -s test-cmd-count-arg
	@$(MAKE) -s test-force-version-arg
	@$(MAKE) -s test-env-arg
	@aws lambda invoke \
		--region $(REGION) \
		--invocation-type RequestResponse \
		--function-name $(MIGRATION_LAMBDA_NAME) \
		--payload "$$(echo '{"branch":"$(BRANCH)","command":"$(CMD)","count":"$(COUNT)","version":"$(VERSION)","directory":"$(DIR)"}' | base64)" \
		invoke.log

# make lambda-up-all DB=test ENV=dev BRANCH=199/db-item-transaction
lambda-up-all:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-branch-arg
	$(foreach DIR,$($(DB)_up), $(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=up COUNT=all;)

# make lambda-down-all DB=test ENV=dev BRANCH=199/db-item-transaction
lambda-down-all:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-branch-arg
	$(foreach DIR,$($(DB)_down), $(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=down COUNT=all;)

# make lambda-drop-all DB=test ENV=dev BRANCH=199/db-item-transaction
lambda-drop-all:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-branch-arg
	$(foreach DIR,$($(DB)_down), $(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=drop COUNT=all;)

# arg tests
test-db-arg:
ifndef DB
	$(error trailing DB assignment missing, e.g. make up DB=test, or DB=prod)
endif

test-db-val:
ifneq ($(DB),$(filter $(DB),test prod))
	$(error trailing DB assignment must be 'test' or 'prod')
endif

test-dir-arg:
ifndef DIR
	$(error trailing DIR assignment missing, e.g. make up DIR=schema)
endif

test-env-arg:
ifndef ENV
	$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

test-name-arg:
ifndef NAME
	$(error trailing NAME assignment missing, e.g. make create NAME=rule)
endif

test-cmd-arg:
ifndef CMD
	$(error trailing CMD assignment missing, e.g. make deploy-migrations CMD=up)
endif

test-count-arg:
ifndef COUNT
	$(error trailing COUNT assignment missing, e.g. make up COUNT=3, OR make up COUNT=all)
endif

test-cmd-count-arg:
ifeq ($(CMD),$(filter $(CMD),up down))
	@$(MAKE) -s test-count-arg
endif

test-version-arg:
ifndef VERSION
	$(error trailing VERSION assignment missing, e.g. make force VERSION=7)
endif

test-force-version-arg:
ifeq ($(CMD),force)
	@$(MAKE) -s test-version-arg
endif

test-branch-arg:
ifndef BRANCH
	$(error trailing BRANCH assignment missing, e.g. BRANCH=your-branch-name)
endif

###################### secrets ######################

clean-env:
	rm -f $(ENV_FILE)

test-env-file:
ifeq (,$(wildcard $(ENV_FILE)))
	$(error no .env file, run 'make get-secrets ENV=dev')
endif

get-secrets:
	@$(MAKE) -s retrieve-each-secret
	@if [ ! -s $(ENV_FILE) ]; then \
		rm $(ENV_FILE); \
		echo 'no env vars required'; \
	else \
		echo 'env vars retrieved'; \
	fi

retrieve-each-secret: test-env-arg clean-env $(ENV_VARS)
$(ENV_VARS):
	@if [ $@ = DATABASE_TYPE ]; then \
		echo DATABASE_TYPE=$(DATABASE_TYPE) >> $(ENV_FILE); \
	else \
		ENV_VAR=$$(aws secretsmanager get-secret-value \
			--region $(REGION) \
			--secret-id $(ENV)/$@ \
			--query 'SecretString' \
			--output text); \
		echo $@=$$ENV_VAR >> $(ENV_FILE); \
	fi

