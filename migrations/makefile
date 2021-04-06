APP=mxfactorial
CONTAINER_NAME=$(APP)-postgres
POSTGRESQL_PASSWORD=test
POSTGRESQL_USERNAME=test
POSTGRESQL_DATABASE=mxfactorial
HOST_PORT=5432
CONTAINER_PORT=5432
POSTGRES_VOLUME_MOUNT_PATH=$(PWD)/postgres-data
CONTAINER_POSTGRES_STORAGE_PATH=/bitnami/postgresql
DOCKER_IMAGE=bitnami/postgresql
IMAGE_VERSION=latest
DATABASE_TYPE=postgres
POSTGRESQL_HOST=localhost
POSTGRESQL_PORT=$(CONTAINER_PORT)

# single go migrate command variables
POSTGRESQL_CONNECTION=$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=migration_$(DIR)_version
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

# looped go migrate targets for postgres in docker
up:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(foreach DIR,$($(DB)_up), migrate -verbose -path ./$(DIR) -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=migration_$(DIR)_version" up;)

down:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(foreach DIR,$($(DB)_down), yes | migrate -verbose -path ./$(DIR) -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=migration_$(DIR)_version" down;)

drop:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	$(foreach DIR,$($(DB)_down), migrate -verbose -path ./$(DIR) -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=migration_$(DIR)_version" drop -f;)

redev:
	$(MAKE) drop DB=test
	$(MAKE) up DB=test

devtest:
	$(MAKE) redev
	$(MAKE) down DB=test

go migrate
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
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" up $(COUNT)

downdir:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-count-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" down $(COUNT)

updirall:
	@$(MAKE) -s test-dir-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" up

downdirall:
	@$(MAKE) -s test-dir-arg
	yes | migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" down

dropdir:
	@$(MAKE) -s test-dir-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" drop -f

force:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-version-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" force $(VERSION)

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

# make lambda-up DB=test ENV=dev BRANCH=199/db-item-transaction
lambda-up-all:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-branch-arg
	$(foreach DIR,$($(DB)_up), $(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=up COUNT=all;)

# make lambda-down DB=test ENV=dev BRANCH=199/db-item-transaction
lambda-down-all:
	@$(MAKE) -s test-db-arg
	@$(MAKE) -s test-db-val
	@$(MAKE) -s test-env-arg
	@$(MAKE) -s test-branch-arg
	$(foreach DIR,$($(DB)_down), $(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=down COUNT=all;)

# make lambda-drop DB=test ENV=dev BRANCH=199/db-item-transaction
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
