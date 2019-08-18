//bitcoin
//multisig address 2 of 2 nested in p2sh
// legacy :2xxx[196]


const bitcoin = require('bitcoinjs-lib')
const util = require('util')
const FEE = 100000
const　testnet　=　{
　　　　messagePrefix:　'\x18Bitcoin　Signed　Message:\n',
　　　　bip32:　{　//　tpub,　tprv
　　　　　　public:　0x043587cf,
　　　　　　private: 0x04358394
　　　　},
　　　　pubKeyHash:　0x6f,
　　　　scriptHash:　0xc4,　//2 start address
　　　　wif:　0xef
}

keys=[
'cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ',
'cPFij267aAFsv1VaPtDEBUBBpeFf81GVaaW9ZG7nqpodNKpf4JqQ'
]
const keyPairs = [
    bitcoin.ECPair.fromWIF(keys[0], testnet),
    bitcoin.ECPair.fromWIF(keys[1], testnet)
]
const pubkeys = keyPairs.map(x => x.publicKey)
const p2ms = bitcoin.payments.p2ms({ m: 2, pubkeys: pubkeys, network: testnet })
const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network:testnet })
const p2sh = bitcoin.payments.p2sh({ redeem: p2wsh, network: testnet })

console.log(p2sh.address)

