"""Wrapper for required Gene Normalization services."""
from typing import List, Tuple

from gene.query import QueryHandler
from gene.schemas import MatchType
from boto3.dynamodb.conditions import Key

from curation import logger, ServiceWarning, MAX_SUGGESTIONS

# set Gene Normalization settings via environment variables -- see Gene Normalization README
gene_query_handler = QueryHandler()


def get_gene_id(term: str) -> str:
    """Get normalized ID given gene symbol/label/alias.
    :param str term: user-entered gene term
    :returns: concept ID, str, if successful
    """
    response = gene_query_handler.normalize(term)
    if response["match_type"] != MatchType.NO_MATCH:
        concept_id = response["gene_descriptor"]["gene"]["gene_id"]
        return concept_id
    else:
        warn = f"Lookup of gene term {term} failed."
        logger.warning(warn)
        raise ServiceWarning(warn)


def get_possible_genes(query: str) -> List[Tuple[str, str]]:
    """Given input query, return possible gene symbol/alias matches (for autocomplete).
    # TODO
      * how to handle extremely large result lists (such that query wouldn't capture all of them?)
      * similarly, we probably need to impose a cutoff suggestion amount (25?)
      * move index generation into gene-norm?
      * consider cache strategies?
      * reduce search scope (just symbol?)
      * pretty sure `query` should always be in items, right?

    :param str query: user-entered string (case-insensitive)
    :return: response, Dict, containing requested term, and either a List of suggested terms or
        warning(s) if lookup fails
    """
    items = set()
    for item_type in ('symbol', 'prev_symbol', 'alias'):
        lookup_response = gene_query_handler.db.genes.query(
            IndexName='gene_startswith',
            KeyConditionExpression=(
                Key('item_type').eq(item_type) & Key('label_and_type').begins_with(query.lower())
            ),
            ProjectionExpression='label_and_type, concept_id'
        )

        items |= {(item['label_and_type'].split('##')[0], item['concept_id'])
                  for item in lookup_response['Items']}

    n = len(items)
    if n > MAX_SUGGESTIONS:
        warn = f"Got {n} possible matches for {query} (exceeds {MAX_SUGGESTIONS})"
        logger.warning(warn)
        raise ServiceWarning(warn)
    elif n == 0:
        return []

    def order_by_source(concept_id: str) -> int:
        if concept_id[0] == 'h':  # for hgnc
            return 0
        elif concept_id[0] == 'e':  # for ensembl
            return 1
        else:  # for ncbi
            return 2

    matches = sorted(sorted(list(items), key=lambda i: order_by_source(i[1])), key=lambda i: i[0])
    return matches


def add_lookup_index():
    """Add global secondary index to gene_concepts table for autocomplete functionality."""
    gene_query_handler.db.dynamodb_client.update_table(
        TableName='gene_concepts',
        AttributeDefinitions=[
            {
                'AttributeName': 'item_type',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'label_and_type',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'concept_id',
                'AttributeType': 'S'
            }
        ],
        GlobalSecondaryIndexUpdates=[
            {
                'Create': {
                    'IndexName': 'gene_startswith',
                    'KeySchema': [
                        {
                            'AttributeName': 'item_type',
                            'KeyType': 'HASH'
                        },
                        {
                            'AttributeName': 'label_and_type',
                            'KeyType': 'RANGE'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'INCLUDE',
                        'NonKeyAttributes': ['concept_id']
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 10,
                        'WriteCapacityUnits': 10
                    }
                }
            }
        ]
    )


# add `startswith` GSI if it doesn't already exist
if not any([i for i in gene_query_handler.db.genes.global_secondary_indexes
            if i['IndexName'] == 'gene_startswith']):
    logger.info('Updating gene_concepts DB table index')
    add_lookup_index()
