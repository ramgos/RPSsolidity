from web3 import Web3
import sys


def main():
    # get metamask address from cmd args
    metamask_address = None
    try:
        metamask_address = sys.argv[1]
    except IndexError:
        raise IndexError("Did you forget to enter metamask address?")
    if not Web3.isAddress(metamask_address):
        raise ValueError(f"Provided argument is not an address. arg: {metamask_address}")

    w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

    # fund metamask account with 1 eth

    w3.eth.send_transaction({
        'from': w3.eth.accounts[0],
        'to': metamask_address,
        'value': 1_000_000_000_000_000_000
    })


if __name__ == "__main__":
    main()