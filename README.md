# Gene Fusion Curation

## Development

### Installation

Clone the repo:

```commandline
git clone https://github.com/cancervariants/fusion-curation
cd fusion-curation
```

To start the backend development server, initialize the Python virtual environment and then run Flask. Once
[Pipenv is installed](https://pipenv-fork.readthedocs.io/en/latest/#install-pipenv-today), run the following in the project root:

```commandline
pipenv shell
pipenv sync
flask run
```

The backend requires local DynamoDB service with tables initialized by the [Gene Normalization service](https://github.com/cancervariants/gene-normalization), listening on port 8000. See the Gene Normalizer documentation for initialization information. 

In a separate terminal, install frontend dependencies and start the React development server:

```commandline
npm install
npm run start
```

Then proceed to http://127.0.0.1:3000/ in a browser window.

Python code style is enforced by [flake8](https://github.com/PyCQA/flake8), and frontend style is enforced by [ESLint](https://eslint.org/). Conformance is ensured by [pre-commit](https://pre-commit.com/#usage). Before your first commit, run

```commandline
pre-commit install
```