"""Provide sequence ID generation services."""
from pathlib import Path
import logging

from biocommons.seqrepo import SeqRepo

from curation import SEQREPO_DATA_PATH, ServiceWarning


logger = logging.getLogger("curation_backend")
logger.setLevel(logging.DEBUG)


def get_seqrepo() -> SeqRepo:
    """Instantiate SeqRepo instance.
    :return: SeqRepo instance
    """
    seqrepo_path = Path(SEQREPO_DATA_PATH)
    if not seqrepo_path.exists():
        raise NotADirectoryError(f"Invalid SeqRepo path provided at "
                                 f"environment variable SEQREPO_DATA_PATH: "
                                 f"{seqrepo_path}")
    return SeqRepo(seqrepo_path)


sr = get_seqrepo()


def get_ga4gh_sequence_id(sequence: str) -> str:
    """Get GA4GH sequence ID for a given sequence.
    :param str sequence: user-provided sequence name
    :return: Tuple containing `sequence_id` and `warnings` fields
    """
    try:
        sequence_id = sr.translate_identifier(sequence, "ga4gh")[0]
    except (KeyError, IndexError) as e:
        msg = f"Unable to retrieve GA4GH sequence ID for {sequence}: {e}"
        logger.warning(msg)
        raise ServiceWarning(msg)
    return sequence_id
