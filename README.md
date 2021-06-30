# Gene Fusion Curation

## Development

### Installation

For a development install, we recommend using Pipenv. See the
[pipenv docs](https://pipenv-fork.readthedocs.io/en/latest/#install-pipenv-today)
for direction on installing pipenv in your compute environment.

Once installed, from the project root dir, just run:

```commandline
pipenv shell
pipenv sync
```

### Init coding style tests

Code style is managed by [flake8](https://github.com/PyCQA/flake8) and checked prior to commit.

We use [pre-commit](https://pre-commit.com/#usage) to run conformance tests.

This ensures:

* Check code style
* Check for added large files
* Detect AWS Credentials
* Detect Private Key

Before first commit run:

```commandline
pre-commit install
```

### Starting the development server

Environment variables should already be set in any shell that executes `pipenv shell`, but if not:

```commandline
export FLASK_ENV=development
export FLASK_APP=curation
```

Start the server:

```commandline
flask run
```

Then proceed to http://127.0.0.1:5000/entry.html in a browser window.