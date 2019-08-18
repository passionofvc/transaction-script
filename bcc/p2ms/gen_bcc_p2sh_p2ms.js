//bitcoin bitcoinjs-lib
//bitcoin-cash bitbox-lib
//multisig address 3 of 5
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

//cNmT4zSKVGsmWi7EtEUMYyjAYRUuxgwTEDei1tNAkHgzfZnqU599
//cUG9e6ZbYTtrKd67H4bABeSEqJEmCgZCk3GnhSr8LrdRedAQPE6n
//cSDTy8DbJ6ghBfU9TrKRjr4wPEUoJ3vFuCHVHxKEKKCgGHQKgbsp
//cQxydnwbyC6ZbKJEkTT2RrCJka7tKSm59wWpBaxzoK8NCeDEpNYZ
//cReB5qyVjpXsPtnYoHqBct9oCbfxC7p2pkZkewpZ51j2oeGsXsoN

let pubkeys = [
    Buffer.from('038939a20113b9fdc94694f38b0bd08387198dfa052d3bd137653428479128e679','hex'),
    Buffer.from('02df791bc80b22d6a64668a246d11697ec331247f8b5dadd2b66819d2cb503c97b','hex'),
    Buffer.from('02c81f8416ac09329d95e3fc50a719da7b5eaeb64c7c914a74fe8d6f8ad3868d38','hex'),
    Buffer.from('027ba5b535f97a3709e6e9e1037f18b59974f58c16bf50db52e05c2c679dc79170','hex'),
    Buffer.from('026ff4d346779666f1ee7ffb1ca7f30d97493515f580c26c7f703d317a4cfff68e','hex')
]

const p2ms = bitcoin.payments.p2ms({ m: 3, pubkeys: pubkeys, network: testnet })
const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: testnet })

console.log(p2sh.address)


/*bitbox*/
let BITBOX = require('bitbox-sdk').BITBOX;
let bitbox = new BITBOX({ restURL: `https://trest.bitcoin.com/v2/` })

pubkeys = [
    Buffer.from('038939a20113b9fdc94694f38b0bd08387198dfa052d3bd137653428479128e679','hex'),
    Buffer.from('02df791bc80b22d6a64668a246d11697ec331247f8b5dadd2b66819d2cb503c97b','hex'),
    Buffer.from('02c81f8416ac09329d95e3fc50a719da7b5eaeb64c7c914a74fe8d6f8ad3868d38','hex'),
    Buffer.from('027ba5b535f97a3709e6e9e1037f18b59974f58c16bf50db52e05c2c679dc79170','hex'),
    Buffer.from('026ff4d346779666f1ee7ffb1ca7f30d97493515f580c26c7f703d317a4cfff68e','hex')
]

let redeemScript = bitbox.Script.multisig.output.encode(3, pubkeys);
let redeemScriptHash=bitbox.Crypto.hash160(redeemScript)
let p2msh=bitbox.Script.scriptHash.output.encode(redeemScriptHash)  //a9 <20bytes-hash> 87
let address = bitbox.Address.fromOutputScript(p2msh, 'testnet');
let legacy_address = bitbox.Address.toLegacyAddress(address)
console.log(address, legacy_address)


