"""Provide specific routing methods for API endpoints."""


def parse_identifier(identifier: str) -> str:
    """Restructure ID value to mesh with serverside requirements

    :param transcript: user-submitted accession identifier
    :return: reformatted to conform to UTA requirements
    """
    if ":" in identifier:
        identifier = identifier.split(":")[1]
    return identifier
