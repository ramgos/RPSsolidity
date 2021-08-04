import web3
from deploy import build_contract
from web3 import Web3


def main():
    w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
    _, contract = build_contract("contracts/RockPaperScissors", w3.eth.accounts[0], w3)
    print(f"Contract address: {contract.address}")    


if __name__ == "__main__":
    main()