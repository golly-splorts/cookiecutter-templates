MODULES=tests

CB := $(shell git branch --show-current)

all:
	@echo "no default make rule defined"

help:
	cat Makefile

lint:
	flake8 $(MODULES)

requirements:
	python3 -m pip install --upgrade -r requirements.txt

test:
	pytest -sv

# Procedure:
# - run make release_X command
# - this will look for environment.X
# - if found, source it and run make deploy

release_mainx:
	@echo "Releasing current branch $(CB) to mainx"
	scripts/release.sh $(CB) mainx

release_integration:
	@echo "Releasing current branch $(CB) to integration"
	scripts/release.sh $(CB) integration

release_prod:
	@echo "Releasing branch integration to prod"
	scripts/release.sh integration prod

test_deploy:
	scripts/deploy.sh --dry-run

deploy_local:
	scripts/deploy_local.sh

deploy:
	scripts/deploy.sh
