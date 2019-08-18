//bitcoin
//multi sig address
//segwit: tbxxxx[32bytes]

const bitcoin = require('bitcoinjs-lib')
const util = require('util')
const FEE = 100000

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

keys=[
     'cPFij267aAFsv1VaPtDEBUBBpeFf81GVaaW9ZG7nqpodNKpf4JqQ',
     'cSPNvQAUQQGBDXnKxLmNUg1f7JdoSoxDBteJUBcqQmsTzexvCatK',
     'cRVrMpdTo4CWvc5L7Cu1Z861KGWiF9vFyK8SNfSugMaTP5mPiJg3'
]

// m of n 3
const keyPairs = [
     bitcoin.ECPair.fromWIF(keys[0], btc_testnet),
     bitcoin.ECPair.fromWIF(keys[1], btc_testnet),
     bitcoin.ECPair.fromWIF(keys[2], btc_testnet)
]
const pubkeys = keyPairs.map(x => x.publicKey)
const p2ms = bitcoin.payments.p2ms({ m: 3, pubkeys, network: btc_testnet })
let p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network: btc_testnet })

console.log('address:', p2wsh.address)

//m of n 1
//const keyPair = bitcoin.ECPair.makeRandom({ network: btc_testnet})
const keyPair = bitcoin.ECPair.makeRandom({ network: btc_testnet})
const p2pk = bitcoin.payments.p2pk({ pubkey: keyPair.publicKey, network: btc_testnet})
p2wsh = bitcoin.payments.p2wsh({ redeem: p2pk, network: btc_testnet})
console.log('address:', p2wsh.address)

