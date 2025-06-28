
from typing import List, Dict


def resolve_proxies(chain: List[str], marker: str = "proxy_") -> List[str]:
    """
    Replace proxy-prefixed wallets with a placeholder.

    Args:
        chain:  ordered list of wallet addresses
        marker: prefix indicating a proxy placeholder

    Returns:
        list with proxies substituted by "unknown_wallet"
    """
    return ["unknown_wallet" if w.startswith(marker) else w for w in chain]


def map_trace_resolution(traces: List[List[str]]) -> List[List[str]]:
    """
    Apply proxy resolution across a list of wallet traces.

    Args:
        traces: list of wallet chains (each chain is a list of addresses)

    Returns:
        list of chains where proxies are resolved
    """
    return [resolve_proxies(trace) for trace in traces]


def resolve_with_index(traces: List[List[str]]) -> List[Dict[int, str]]:
    """
    Produce an index→address mapping for each trace, helpful for audits.

    Example output for one trace:
        {0: "walletA", 1: "unknown_wallet", 2: "walletB"}

    Args:
        traces: list of wallet chains

    Returns:
        list of dicts keyed by position, value is resolved address
    """
    resolved = []
    for trace in traces:
        resolved.append({i: addr for i, addr in enumerate(resolve_proxies(trace))})
    return resolved
