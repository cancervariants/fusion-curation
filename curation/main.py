from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from typing import Dict
from curation.schemas import NormalizeGeneResponse
from curation.gene_services import get_gene_id

app = FastAPI()


normalize_gene_summary = 'Normalize gene term.'
normalize_gene_response_description = 'A normalized concept ID.'
normalize_gene_description = 'Given a gene term, return a normalized concept ID.'

@app.get('/lookup/gene',
         summary=normalize_gene_summary,
         operation_id='normalizeGene',
         response_description=normalize_gene_response_description,
         response_model=NormalizeGeneResponse,
         description=normalize_gene_description)
def normalize_gene(term: str = Query('', description='normalize_gene_descr')) -> Dict:
    """Normalize gene term provided by user.
    :param str term: gene symbol/alias/name/etc
    :return: JSON response with normalized ID if successful and warnings otherwise
    """
    concept_id, warnings = get_gene_id(term)
    return {
        'term': term,
        'concept_id': concept_id,
        'warnings': warnings
    }

# serve static files
app.mount('/', StaticFiles(directory='curation/build/'), name='static')



