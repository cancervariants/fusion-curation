# Gene Fusion Curation

## Development

### Installation

Clone the repo:

```commandline
git clone https://github.com/cancervariants/fusion-curation
cd fusion-curation
```

[Install Pipenv](https://pipenv-fork.readthedocs.io/en/latest/#install-pipenv-today) if necessary.

Install backend dependencies and enter Pipenv environment:

```commandline
pipenv lock
pipenv sync
pipenv shell
```

Set up [uta](https://github.com/biocommons/uta):

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

To connect to the UTA database, you can use the default url (`postgresql://uta_admin@localhost:5433/uta/uta_20210129`). If you use the default url, you must either set the password using environment variable `UTA_PASSWORD` or setting the parameter `db_pwd` in the UTA class.

If you do not wish to use the default, you must set the environment variable `UTA_DB_URL` which has the format of `driver://user:pass@host/database/schema`.

Set up [SeqRepo](https://github.com/biocommons/biocommons.seqrepo):

```commandline
# within fusion-curation root directory
pipenv shell # if not already within pipenv shell
cd curation
mkdir data
seqrepo -r data/seqrepo pull -i 2021-01-29
sudo chmod -R u+w data/seqrepo
cd data/seqrepo
seqrepo_date_dir=$(ls -d */)
sudo mv $seqrepo_date_dir latest
```

Alternate SeqRepo locations can be specified with the environment variable `SEQREPO_DATA_PATH`.

The backend requires local DynamoDB service with tables initialized by the [Gene Normalization service](https://github.com/cancervariants/gene-normalization), listening on port 8000. See the Gene Normalizer documentation for initialization information.

In a terminal running the Pipenv Python environment, start Flask:

```commandline
flask run
```

If you encounter error messages about Flask environment variables, you may need to do the following:

```commandline
export FLASK_ENV=development
export FLASK_APP=curation
flask run
```

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

### UI Version 2
The most recent UI updates can be found in the client directory. It currently makes use of dummy data via the testAPI directory. 

To run this version (from the root directory):
```commandline
cd client/testAPI
npm i
node app
cd ../src
yarn install
yarn start
```
Navigate to http://localhost:3000/ to test the application locally (the server should be running on port 9000)
