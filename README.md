# Gene Fusion Curation

## Development

### Installation

Clone the repo:

```commandline
git clone https://github.com/cancervariants/fusion-curation
cd fusion-curation
```

Gene Fusion Curation uses [uta](https://github.com/biocommons/uta).

_The following commands will likely need modification appropriate for the installation environment._
1. Install [PostgreSQL](https://www.postgresql.org/)
2. Create user and database.

```commandline
createuser -U postgres uta_admin
createuser -U postgres anonymous
createdb -U postgres -O uta_admin uta
```

3. To install locally, from the _curation/data_ directory:
```
UTA_VERSION = uta_20210129.pgd.gz
curl -O http://dl.biocommons.org/uta/$UTA_VERSION
gzip -cdq ${UTA_VERSION} | grep -v "^REFRESH MATERIALIZED VIEW" | psql -h localhost -U uta_admin --echo-errors --single-transaction -v ON_ERROR_STOP=1 -d uta -p 5433
```

To start the backend development server, initialize the Python virtual environment and then run Flask. Once
[Pipenv is installed](https://pipenv-fork.readthedocs.io/en/latest/#install-pipenv-today), run the following in the project root:

```commandline
pipenv shell
pipenv sync
flask run
```

If you encounter error messages about Flask environment variables, you may need to do the following:

```commandline
export FLASK_ENV=development
export FLASK_APP=curation
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