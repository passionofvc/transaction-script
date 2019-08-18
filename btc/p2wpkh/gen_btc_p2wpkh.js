//bitcoin
//single sig address
//segwit: tbxxx

const bitcoin = require('bitcoinjs-lib')
const util = require('util')
const FEE = 10000

const　btc_testnet　=　{
　　　　messagePrefix:　'\x18Bitcoin　Signed　Message:\n',
        bech32: 'tb',
　　　　bip32:　{　//　tpub,　tprv
　　　　　　public:　0x043587cf,
　　　　　　private: 0x04358394
　　　　},
　　　　pubKeyHash:　0x6f,
　　　　scriptHash:　0xc4,　//2 start address
　　　　wif:　0xef
}

key='cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ'
let keyPair = bitcoin.ECPair.fromWIF(key, btc_testnet)
let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: btc_testnet })
console.log(p2wpkh.address, p2wpkh.output.toString('hex'))

