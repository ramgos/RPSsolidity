import subprocess
from web3 import Web3
import deploy
import unittest
import json

# Test contract locally using ganache-cli

# GANACHE_CLI - command to open ganache-cli
with open("config.json") as configf:
    CONFIG = json.load(configf)
    GANACHE_CLI = f"{CONFIG['node']} {CONFIG['ganache-cli']}"

ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"


# creates contract based on path and opens 
class NewContext():
    def __init__(self, path, *args, log=subprocess.DEVNULL, err_log=subprocess.DEVNULL):
        self._path = path
        self._args = args
        self._log = log
        self._err_log = err_log

    def __enter__(self):
        self._process = subprocess.Popen(GANACHE_CLI, stdout=self._log, stderr=self._err_log)
        self._w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

        self._deployer_acct = self._w3.eth.accounts[0]

        _, self._contract = deploy.build_contract(self._path, self._deployer_acct, self._w3, *self._args)
        return self
    
    def __exit__(self, exc_type, exc_value, exc_traceback):
        self._process.terminate()
        self._process.wait()
    
    @property
    def w3(self):
        return self._w3

    @property
    def contract(self):
        return self._contract
    
    @property
    def deployer(self):
        return self._deployer_acct


class HelloWorldTest(unittest.TestCase):
    def test_get_message(self):
        new_message = "Hello!"
        with NewContext("contracts/HelloWorld", new_message) as ctx:
            self.assertEqual(ctx.contract.functions.getMessage().call(), new_message)
    
    def test_set_message(self):
        start_message = "Hello!"
        new_message = "Bye!"
        with NewContext("contracts/HelloWorld", start_message) as ctx:
            tx_hash = ctx.contract.functions.setMessage(new_message).transact({
                "from": ctx.deployer
            })
            _ = ctx.w3.eth.wait_for_transaction_receipt(tx_hash)  # wait until receipt is ready
            self.assertEqual(ctx.contract.functions.getMessage().call(), new_message)


if __name__ == '__main__':
    unittest.main()
