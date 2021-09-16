"""Wrapper for required Gene Normalization services."""
from curation import logger
from gene.query import QueryHandler
from gene.schemas import MatchType
from typing import List, Tuple, Optional, Dict
from boto3.dynamodb.conditions import Key


# set Gene Normalization settings via environment variables -- see Gene Normalization README
gene_query_handler = QueryHandler()


def get_gene_id(term: str) -> Tuple[Optional[str], List[str]]:
    """Get normalized ID given gene symbol/label/alias.
    :param str term: user-entered gene term
    :returns: Tuple with a concept ID (str, empty if fails) and List of
        warnings (empty if fully successful)
    """
    response = gene_query_handler.normalize(term)
    if response['match_type'] != MatchType.NO_MATCH:
        concept_id = response['gene_descriptor']['gene']['gene_id']
        return (concept_id, [])
    else:
        warn = f'Lookup of gene term {term} failed.'
        logger.warning(warn)
        return (None, [warn])


def get_possible_genes(query: str) -> Dict:
    """Given input query, return possible gene symbol/alias matches (for autocomplete).
    Currently tries to provide exact match first, then all other possible matches
    # TODO
      * how to handle extremely large result lists (such that query wouldn't capture all of them?)
      * similarly, we probably need to impose a cutoff suggestion amount (25?)
      * move index generation into gene-norm?
      * different index key? Using source now -- could do item_type instead?
      * consider cache strategies?
      * reduce search scope (just symbol?)
      * pretty sure `query` should always be in items, right?
    :param str query: user-entered string (case-insensitive)
    :return: list of valid gene search terms
    """
    item_types = ('symbol', 'prev_symbol', 'alias')
    query_match = False
    for item_type in item_types:
        response = gene_query_handler.db.genes.query(
            KeyConditionExpression=Key('label_and_type').eq(f'{query}##{item_type}'),
            ProjectionExpression='label_and_type'
        )
        if response['Items']:
            query_match = True
            break

    items = set()
    for item_type in item_types:
        response = gene_query_handler.db.genes.query(
            IndexName='gene_startswith',
            KeyConditionExpression=(
                Key('item_type').eq(item_type) & Key('label_and_type').begins_with(query.lower())
            ),
            ProjectionExpression='label_and_type'
        )

        items |= {item['label_and_type'].split('##')[0] for item in response['Items']}
    if query_match and query in items:
        items.remove(query)
        matches = [query] + list(items)
    else:
        matches = list(items)
    return {
        'query': query,
        'matches': matches
    }


def update_gene_table():
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
                        'ProjectionType': 'KEYS_ONLY'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 1,
                        'WriteCapacityUnits': 1
                    }
                }
            }
        ]
    )

# add `startswith` GSI if it doesn't already exist
if not any([i for i in gene_query_handler.db.genes.global_secondary_indexes
            if i['IndexName'] == 'gene_startswith']):
    logger.info('Updating gene_concepts DB table index')
    update_gene_table()
