<h1 align="center">
CurFu: Curating fusions with the VICC Gene Fusion Guidelines
</h1>

CurFu is an interactive curation tool for describing and representing gene fusions in a computable manner. It's developed to support the [VICC Fusion Guidelines](https://fusions.cancervariants.org/) project.

## Development

### Installation

Clone the repo:

```commandline
git clone https://github.com/cancervariants/fusion-curation
cd fusion-curation
```

Ensure that the following data sources are available:

- the [VICC Gene Normalization](https://github.com/cancervariants/gene-normalization) database, accessible from a DynamoDB-compliant service. Set the endpoint address with environment variable `GENE_NORM_DB_URL`; default value is `http://localhost:8000`.
- the [Biocommons SeqRepo](https://github.com/biocommons/biocommons.seqrepo) database. Provide local path with environment variable `SEQREPO_DATA_PATH`; default value is `/usr/local/share/seqrepo/latest`.
- the [Biocommons Universal Transcript Archive](https://github.com/biocommons/uta), by way of VICC's [UTA Tools](https://github.com/GenomicMedLab/uta-tools) package. Connection parameters to the Postgres database are set most easily as a [Libpq-compliant URL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING) under the environment variable `UTA_DB_URL`.

Create a virtual environment for the server and install. Note: there's also a Pipfile so you can skip the virtualenv steps if you'd rather use a Pipenv instance instead of virtualenv/venv. I have been sticking with the latter because [Pipenv doesn't play well with entry points in development](https://stackoverflow.com/a/69225249), but if you aren't editing them in `setup.cfg`, then the former should be fine.

```commandline
cd server  # regardless of your environment decision, build it in server/
virtualenv venv
source venv/bin/activate
python3 -m pip install -e ".[dev,tests]"  # make sure to include the extra dependencies!
```

Acquire two sets of static assets and place all of them within the `server/curation/data` directory:

1. Gene autocomplete files, providing legal gene search terms to the client autocomplete component. One file each is used for entity types `aliases`, `assoc_with`, `xrefs`, `prev_symbols`, `labels`, and `symbols`. Each should be named according to the pattern `gene_<type>_<YYYYMMDD>.tsv`. These can be regenerated with the shell command `curfu_devtools genes`.

2. Domain lookup file, for use in providing possible functional domains for user-selected genes in the client. This should be named according to the pattern `domain_lookup_YYYYMMDD.tsv`. These can be regenerated with the shell command `curfu_devtools domains`, although this is an extremely time- and storage-intensive process.

Your data/directory should look something like this:

```
curation/data
├── domain_lookup_2022-01-20.tsv
├── gene_aliases_suggest_20211025.tsv
├── gene_assoc_with_suggest_20211025.tsv
├── gene_labels_suggest_20211025.tsv
├── gene_prev_symbols_suggest_20211025.tsv
├── gene_symbols_suggest_20211025.tsv
└── gene_xrefs_suggest_20211025.tsv
```

Finally, start backend service with `curfu`, by default on port 5000. Alternative ports can be selected like so:

```commandline
curfu -p 5001
```

In another shell, navigate to the repo `client/` directory and install frontend dependencies:

```commandline
cd client
yarn install
```

Then start the development server:

```commandline
yarn start
```

### Shared type definitions

The frontend utilizes Typescript definitions generated from the backend pydantic schema. These can be refreshed, from the server environment, with the command `curfu_devtools client-types`. This will only work if `json2ts` has been installed in the `node_modules` binary directory.

### Style

Python code style is enforced by [flake8](https://github.com/PyCQA/flake8), and frontend style is enforced by [ESLint](https://eslint.org/). Conformance is ensured by [pre-commit](https://pre-commit.com/#usage). Before your first commit, run

```commandline
pre-commit install
```

This will require installation of `dev` dependencies on the server side.

### Tests

Requires installation of `tests` dependencies. Run with `pytest`.
