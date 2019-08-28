//litecoin
//single sig address
//segwit: tltcxxx

const bitcoin = require('bitcoinjs-lib')
const explorers = require('litecore-explorers')
const util = require('util')
const FEE = 100000
let litecore = explorers.litecore
//network_litecoin_testnet
const　ltc_testnet　=　{
　　　　messagePrefix:　'\x19Litecoin　Signed　Message:\n',
        bech32: 'tltc',
　　　　bip32:　{　//　tpub,　tprv
　　　　　　public:　0x043587cf,
　　　　　　private: 0x04358394
　　　　},
　　　　pubKeyHash:　0x6f,
　　　　scriptHash:　0xc4,　//2 start address
　　　　wif:　0xef
}

key='cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ'
let keyPair = bitcoin.ECPair.fromWIF(key, ltc_testnet)
let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: ltc_testnet })
console.log(p2wpkh.address)

