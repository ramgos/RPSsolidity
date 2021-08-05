from web3 import Web3


def main():
    w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
    w3.eth.send_transaction({
        'from': w3.eth.accounts[0],
        'to': '0xF4395fC89763A2Cdf1d01EbA0218a49D9B9CdB71',
        'value': 1_000_000_000_000_000_000
    })


if __name__ == "__main__":
    main()