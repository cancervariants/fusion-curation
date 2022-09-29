.PHONY: clean, build_client

requirements: server/Pipfile
ifeq ($(PIPENV), 1)
	pipenv lock --requirements > server/requirements.txt
	pipenv lock --dev --requirements > server/requirements-dev.txt
endif

clean:
	@find . -type f -name '*.pyc' -delete
	@find . -type d -name '__pycache__' | xargs rm -rf
	@rm -rf server/build/
	@rm -rf server/dist/
	@rm -f server/*.egg*

build_client:
	yarn --cwd client/ build

models: server/curation/schemas.py
	pydantic2ts --module server/curation/schemas.py --output client/src/services/ResponseModels.ts --json2ts-cmd client/node_modules/.bin/json2ts
