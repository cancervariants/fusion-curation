"""Provide sequence ID generation services."""
from biocommons.seqrepo import SeqRepo
from os import environ
from pathlib import Path
import logging
from typing import Dict


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


def get_sequence_id(sequence: str) -> Dict:
    """Get GA4GH sequence ID for a given sequence.
    :param str sequence: user-provided sequence name
    :return: Dict containing `sequence_id` and `warnings` fields
    """
    try:
        sequence_id = sr.translate_identifier(sequence, 'ga4gh')[0]
    except KeyError:
        msg = f'Sequence {sequence} not recognized.'
        return {
            'sequence_id': '',
            'warnings': [
                f'Lookup of sequence {sequence} failed.'
            ]
        }
    except IndexError:
        msg = f'Sequence {sequence} returned 0 sequence IDs from SeqRepo.'
        logger.warning(msg)
        return {
            'sequence_id': '',
            'warnings': [
                f'Lookup of sequence {sequence} failed.'
            ]
        }
    return {
        'sequence_id': sequence_id,
        'warnings': [],
    }
