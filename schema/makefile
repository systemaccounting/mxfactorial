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

# arg tests
test-dir-arg:
ifndef DIR
	$(error trailing DIR assignment missing, e.g. make up DIR=migrations)
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

# postgres
POSTGRESQL_CONNECTION=$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_$(DIR)
MIGRATIONS_DIR=$(CURDIR)/$(DIR)

# migration lambda vars
MIGRATION_LAMBDA_NAME=go-migrate-faas-$(ENV)
REGION=us-east-1

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

# go migrate
init:
	@$(MAKE) -s test-dir-arg
	migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq init_schema

create:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-name-arg
	migrate -verbose create -ext sql -dir $(MIGRATIONS_DIR) -seq $(NAME)

up:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-count-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" up $(COUNT)

down:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-count-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" down $(COUNT)

up-all:
	@$(MAKE) -s test-dir-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" up

down-all:
	@$(MAKE) -s test-dir-arg
	yes | migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" down

drop:
	@$(MAKE) -s test-dir-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" drop -f

drop-all:
	migrate -verbose -path ./migrations -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_migrations" drop -f
	migrate -verbose -path ./seed -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_seed" drop -f
	migrate -verbose -path ./testseed -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_testseed" drop -f

force:
	@$(MAKE) -s test-dir-arg
	@$(MAKE) -s test-version-arg
	migrate -verbose -path $(MIGRATIONS_DIR) -database "$(POSTGRESQL_CONNECTION)" force $(VERSION)

test:
	$(MAKE) up-all
	$(MAKE) down-all

clear:
	$(MAKE) drop

redev:
	migrate -verbose -path ./migrations -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_migrations" drop -f
	migrate -verbose -path ./migrations -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_migrations" up
	migrate -verbose -path ./seed -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_seed" up
	migrate -verbose -path ./testseed -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_testseed" up

devtest:
	migrate -verbose -path ./migrations -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_migrations" drop -f
	migrate -verbose -path ./migrations -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_migrations" up
	migrate -verbose -path ./seed -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_seed" up
	migrate -verbose -path ./testseed -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_testseed" up
	yes | migrate -verbose -path ./testseed -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_testseed" down
	yes | migrate -verbose -path ./seed -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_seed" down
	yes | migrate -verbose -path ./migrations -database "$(DATABASE_TYPE)://$(POSTGRESQL_USERNAME):$(POSTGRESQL_PASSWORD)@$(POSTGRESQL_HOST):$(POSTGRESQL_PORT)/$(POSTGRESQL_DATABASE)?sslmode=disable&x-migrations-table=schema_version_migrations" down

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

# e.g. make deploy-all-testdb-up ENV=dev BRANCH=199/db-item-transaction
deploy-all-testdb-up:
	$(eval CMD := up)
	$(eval COUNT := all)
	$(eval DIR := migrations)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)
	$(eval CMD := up)
	$(eval COUNT := all)
	$(eval DIR := seed)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)
	$(eval CMD := up)
	$(eval COUNT := all)
	$(eval DIR := testseed)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)

# e.g. make deploy-all-testdb-down ENV=dev BRANCH=199/db-item-transaction
deploy-all-testdb-down:
	$(eval CMD := down)
	$(eval COUNT := all)
	$(eval DIR := testseed)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)
	$(eval CMD := down)
	$(eval COUNT := all)
	$(eval DIR := seed)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)
	$(eval CMD := down)
	$(eval COUNT := all)
	$(eval DIR := migrations)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)

# e.g. make deploy-all-testdb-drop ENV=dev BRANCH=199/db-item-transaction
deploy-all-testdb-drop:
	$(eval CMD := drop)
	$(eval DIR := testseed)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD)
	$(eval CMD := drop)
	$(eval DIR := seed)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD)
	$(eval CMD := drop)
	$(eval DIR := migrations)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD)

# e.g. make deploy-all-prod-up ENV=dev BRANCH=master
deploy-all-prod-up:
	$(eval CMD := up)
	$(eval COUNT := all)
	$(eval DIR := migrations)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)
	$(eval CMD := up)
	$(eval COUNT := all)
	$(eval DIR := seed)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)

# e.g. make deploy-all-prod-down ENV=dev BRANCH=master
deploy-all-prod-down:
	$(eval CMD := down)
	$(eval COUNT := all)
	$(eval DIR := seed)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)
	$(eval CMD := down)
	$(eval COUNT := all)
	$(eval DIR := migrations)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD) COUNT=$(COUNT)

# e.g. make deploy-all-prod-drop ENV=dev BRANCH=master
deploy-all-prod-drop:
	$(eval CMD := drop)
	$(eval DIR := seed)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD)
	$(eval CMD := drop)
	$(eval DIR := migrations)
	$(MAKE) deploy-migrations ENV=$(ENV) DIR=$(DIR) BRANCH=$(BRANCH) CMD=$(CMD)