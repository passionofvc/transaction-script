//litecoin
// p2sh-p2wpkh
// legacy :2xxx[196], segwit: Qxxxx[58]

const bitcoin = require('bitcoinjs-lib')
const explorers = require('litecore-explorers')
const util = require('util')
const FEE = 100000
let litecore = explorers.litecore
     //network_litecoin_testnet
const　ltc_testnet　=　{
　　　　messagePrefix:　'\x19Litecoin　Signed　Message:\n',
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
let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network:ltc_testnet })
let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network:ltc_testnet })


let buffer = bitcoin.address.fromBase58Check(p2sh.address)
let segwitAddress = new litecore.Address(buffer.hash, 'testnet', 'scripthash').toString()
console.log(p2sh.address, segwitAddress)

