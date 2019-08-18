//bitcoin
// p2sh-p2wpkh
// legacy :2xxx[196], segwit: Qxxxx[58]

const bitcoin = require('bitcoinjs-lib')
const explorers = require('bitcore-explorers')
const util = require('util')
const FEE = 10000
let bitcore = explorers.bitcore
const btc_testnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

const btc_mainnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bc',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};

const testnet = btc_testnet
//const testnet = btc_mainnet

key='cUQZd5T79bsGq1iX8v8CGHckEvFhZiqQMbBkp6dSzvXkTAggp2FQ'
let keyPair = bitcoin.ECPair.fromWIF(key, testnet)
let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network:testnet })
let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network:testnet })

console.log(p2sh.address, p2sh.redeem.output.toString('hex'))

