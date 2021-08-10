# shuffle funds between two accounts to mine a block every 2 seconds

from web3 import Web3
from time import sleep


def main():
    w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

    while True:
        w3.eth.send_transaction({
            'from': w3.eth.accounts[0],
            'to': w3.eth.accounts[1],
            'value': 1_000_000_000
        })
        sleep(2)
        w3.eth.send_transaction({
            'from': w3.eth.accounts[1],
            'to': w3.eth.accounts[0],
            'value': 1_000_000_000
        })
        sleep(2)


if __name__ == "__main__":
    main()