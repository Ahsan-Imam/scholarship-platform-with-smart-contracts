from algokit_utils import AlgorandClient
import os

print('--- Env vars containing alg/indexer/token/api ---')
for k,v in sorted(os.environ.items()):
    if any(x in k.lower() for x in ("alg", "algo", "algod", "indexer", "token", "api", "algokit")):
        print(f"{k}={v}")

print('\n--- AlgorandClient inspection ---')
try:
    c = AlgorandClient.from_environment()
    print('AlgorandClient:', type(c))
    cm = getattr(c, 'client', None)
    print('Client manager:', type(cm))
    try:
        algod_client = cm.get('algod') if cm else None
        print('algod client:', algod_client)
        if algod_client is not None:
            print('algod token attr:', getattr(algod_client, 'token', None))
            print('algod headers attr:', getattr(algod_client, 'headers', None))
            print('algod base_url attr:', getattr(algod_client, 'base_url', None))
    except Exception as e:
        print('error inspecting algod client:', e)

    try:
        indexer_client = cm.get('indexer') if cm else None
        print('indexer client:', indexer_client)
        if indexer_client is not None:
            print('indexer token attr:', getattr(indexer_client, 'token', None))
            print('indexer headers attr:', getattr(indexer_client, 'headers', None))
            print('indexer base_url attr:', getattr(indexer_client, 'base_url', None))
    except Exception as e:
        print('error inspecting indexer client:', e)
except Exception as e:
    print('error creating AlgorandClient.from_environment():', e)
