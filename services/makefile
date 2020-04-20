DIR := ${CURDIR}
SUBDIRS := $(wildcard */.)

test-env-arg:
ifndef ENV
		$(error trailing ENV assignment missing, e.g. make test ENV=dev)
endif

warm-up: $(SUBDIRS) test-env-arg
		@for dir in $(SUBDIRS); do \
			if [ -f $$dir/makefile ]; then \
				echo $$dir; \
				$(MAKE) -C $$dir ENV=$(ENV) warm-up; \
			fi \
		done

deploy: $(SUBDIRS) test-env-arg
		@for dir in $(SUBDIRS); do \
			if [ -f $$dir/makefile ]; then \
				$(MAKE) -C $$dir ENV=$(ENV) deploy; \
			fi \
		done

deploy-all: $(SUBDIRS) test-env-arg
		@for dir in $(SUBDIRS); do \
			if [ -f $$dir/makefile ]; then \
				$(MAKE) -C $$dir ENV=$(ENV) deploy-all; \
			fi \
		done


