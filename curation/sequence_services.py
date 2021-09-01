"""Provide sequence ID generation services."""
from biocommons.seqrepo import SeqRepo
from os import environ
from pathlib import Path
import logging


logger = logging.getLogger('curation_backend')
logger.setLevel(logging.DEBUG)


def get_seqrepo() -> SeqRepo:
    """Instantiate SeqRepo instance.
    :return: SeqRepo instance
    """
    if 'SEQREPO_PATH' in environ:
        seqrepo_path = Path(environ['SEQREPO_PATH'])
        if not seqrepo_path.exists():
            raise NotADirectoryError(f'Invalid SeqRepo path provided at '
                                     f'environment variable SEQREPO_PATH: '
                                     f'{seqrepo_path}')
    else:
        seqrepo_path = Path('/usr/local/share/seqrepo/latest')
        if not seqrepo_path.exists():
            raise NotADirectoryError(f'Could not locate SeqRepo directory; either '
                                     f'place at {seqrepo_path} or specify path '
                                     f'via environment variable SEQREPO_PATH.')
    return SeqRepo(seqrepo_path)


sr = get_seqrepo()


def get_ga4gh_sequence_id(sequence: str) -> str:
    """Get GA4GH sequence ID for a given sequence.
    :param str sequence: user-provided sequence name
    :return: Dict containing `sequence_id` and `warnings` fields
    """
    return sr.translate_identifier(sequence, 'ga4gh')[0]
