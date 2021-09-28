"""Provide sequence ID generation services."""
from biocommons.seqrepo import SeqRepo
from pathlib import Path
import logging
from curation import SEQREPO_DATA_PATH
from typing import Tuple, List


logger = logging.getLogger('curation_backend')
logger.setLevel(logging.DEBUG)


def get_seqrepo() -> SeqRepo:
    """Instantiate SeqRepo instance.
    :return: SeqRepo instance
    """
    seqrepo_path = Path(SEQREPO_DATA_PATH)
    if not seqrepo_path.exists():
        raise NotADirectoryError(f'Invalid SeqRepo path provided at '
                                 f'environment variable SEQREPO_DATA_PATH: '
                                 f'{seqrepo_path}')
    return SeqRepo(seqrepo_path)


sr = get_seqrepo()


def get_ga4gh_sequence_id(sequence: str) -> Tuple[str, List[str]]:
    """Get GA4GH sequence ID for a given sequence.
    :param str sequence: user-provided sequence name
    :return: Tuple containing `sequence_id` and `warnings` fields
    """
    try:
        sequence_id = sr.translate_identifier(sequence, 'ga4gh')[0]
        warnings = []
    except (KeyError, IndexError) as e:
        msg = f'Unable to retrieve GA4GH sequence ID for {sequence}: {e}'
        logger.warning(msg)
        sequence_id = ''
        warnings = [msg]
    return (sequence_id, warnings)
