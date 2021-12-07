"""Provide sequence ID generation services."""
import logging

logger = logging.getLogger("curation_backend")
logger.setLevel(logging.DEBUG)


class InvalidInputException(Exception):
    """Provide exception for input validation."""

    pass


def get_strand(input: str) -> int:
    """Validate strand arguments received from client.
    :param str input: strand argument from client
    :return: correctly-formatted strand
    :raises InvalidInputException: if strand arg is invalid
    """
    if input == '+':
        return 1
    elif input == '-':
        return -1
    else:
        raise InvalidInputException
