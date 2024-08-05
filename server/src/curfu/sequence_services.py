"""Provide sequence ID generation services."""

import logging

logger = logging.getLogger("curfu")
logger.setLevel(logging.DEBUG)


class InvalidInputError(Exception):
    """Provide exception for input validation."""


def get_strand(strand_input: str) -> int:
    """Validate strand arguments received from client.

    :param input: strand argument from client
    :return: correctly-formatted strand
    :raise InvalidInputException: if strand arg is invalid
    """
    if strand_input == "+":
        return 1
    if strand_input == "-":
        return -1
    raise InvalidInputError
