from eth_account import account
from eth_utils import address
from web3 import Web3
import json


# deploy contract, return reciept and abi
def deploy(path, account, w3, *args):
    with open(f"bin/{path}.abi", "r") as abi_p:
        abi = json.loads(abi_p.read())
    with open(f"bin/{path}.bin", "r") as bytecode_p:
        bytecode = bytecode_p.read()
    
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    # print(f"Account {account} balance before deployment: {w3.eth.getBalance(account)}")

    tx_hash = contract.constructor(*args).transact({"from": account})
    tx_reciept = w3.eth.get_transaction_receipt(tx_hash)

    # print(f"Account {account} balance after deployment: {w3.eth.getBalance(account)}")
    return tx_reciept, abi


# deploy and get contract object
def build_contract(path, account, w3, *args):
    tx_reciept, abi = deploy(path, account, w3, *args)
    return tx_reciept, w3.eth.contract(address=tx_reciept["contractAddress"], abi=abi)


# example use of deploy.py
def _hello_world():
    w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
    account = w3.eth.accounts[0]
    _, contract = build_contract("contracts/HelloWorld", account, w3, "Hi!")
    
    print(contract.functions.getMessage().call())
    contract.functions.changeMessage("Hello!").transact({"from": account})
    print(contract.functions.getMessage().call())