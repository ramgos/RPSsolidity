from deploy import build_contract
from web3 import Web3
import psutil
import subprocess
import asyncio
import json
import sys


def pid_by_port(port):
    connections = psutil.net_connections()
    for conn in connections:
        p = conn[3].port
        if p == port:
            return conn[6]


def pid_by_listen_port(port):
    connections = psutil.net_connections()
    for conn in connections:
        p = conn[3].port
        state = conn[5]
        if p == port and state == psutil.CONN_LISTEN:
            return conn[6]

# create ganache process and return subprocess process
async def create_ganache():
    # shut down ganache-cli if it is running already
    ganache_pid = pid_by_listen_port(8545)
    if ganache_pid is not None:
        ganache_proc = psutil.Process(ganache_pid)
        ganache_proc.terminate()
    
    return subprocess.Popen(["ganache-cli"], shell=True)  # shell is set to true to not deal with paths of node and ganache-cli


# poll ganache process every 1 sec
async def poll_ganache(ganache):
    while ganache.poll() is None:
        await asyncio.sleep(1)


async def main():
    # get metamask address from cmd args
    metamask_address = None
    try:
        metamask_address = sys.argv[1]
    except IndexError:
        raise IndexError("Did you forget to enter metamask address?")
    if not Web3.isAddress(metamask_address):
        raise ValueError(f"Provided argument is not an address. arg: {metamask_address}")

    ganache_proc = await create_ganache()
    w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

    # fund metamask account with 1 eth and create rock paper scissors contract

    w3.eth.send_transaction({
        'from': w3.eth.accounts[0],
        'to': metamask_address,
        'value': 1_000_000_000_000_000_000
    })
    _, contract = build_contract("contracts/RockPaperScissors", w3.eth.accounts[0], w3)

    # update react app enviornment

    print(f"Contract address: {contract.address}")
    with open("react-app/src/env.json", "w") as f:
        json.dump({
            "contractAddress": contract.address,
            "userAddress": metamask_address
        }, f, indent=4)

    # never halts, polls continuesly until ganache process terminates
    await poll_ganache(ganache_proc)



if __name__ == "__main__":
    asyncio.run(main())  # placeholder address