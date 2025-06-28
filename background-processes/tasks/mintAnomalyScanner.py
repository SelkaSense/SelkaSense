import time
from datetime import datetime
from solana.rpc.api import Client

RPC_ENDPOINT = "https://api.mainnet-beta.solana.com"
SCAN_INTERVAL_SECONDS = 600  # 10 минут

client = Client(RPC_ENDPOINT)


def fetch_recent_mints(limit=50):
    current_slot = client.get_slot()["result"]
    mints = []

    for slot in range(current_slot - limit, current_slot):
        block = client.get_block(slot)
        if not block.get("result"):
            continue

        for tx in block["result"].get("transactions", []):
            for instr in tx["transaction"]["message"]["instructions"]:
                if isinstance(instr, dict) and instr.get("program") == "spl-token":
                    parsed = instr.get("parsed", {})
                    if parsed.get("type") == "initializeMint":
                        mints.append({
                            "mint": parsed["info"].get("mint"),
                            "authority": parsed["info"].get("authority"),
                            "timestamp": block["result"].get("blockTime")
                        })

    return mints


def log_mint_activity(mints):
    print(f"[{datetime.utcnow().isoformat()}] Detected {len(mints)} new mint(s):")
    for mint in mints:
        timestamp = datetime.utcfromtimestamp(mint["timestamp"]).isoformat() if mint["timestamp"] else "unknown"
        print(f" • Mint: {mint['mint']}, Authority: {mint['authority']}, Time: {timestamp}")


def run_tracker():
    while True:
        try:
            new_mints = fetch_recent_mints()
            if new_mints:
                log_mint_activity(new_mints)
            else:
                print(f"[{datetime.utcnow().isoformat()}] No new mints found.")
        except Exception as e:
            print(f"[ERROR] {e}")

        time.sleep(SCAN_INTERVAL_SECONDS)


if __name__ == "__main__":
    run_tracker()
