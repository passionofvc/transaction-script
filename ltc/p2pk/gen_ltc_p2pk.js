//litecoin
//
// p2pk
// obsolete pay-to-pubkey
//

const bitcoin = require('bitcoinjs-lib')
const bs58check = require('bs58check');

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
const testnet = ltc_testnet

key='cQFnFwrBM9unVSwUrPu65BSHwQ642pzFzQvtWKHy5ATyZMt434BD'
let keyPair = bitcoin.ECPair.fromWIF(key, testnet)
let p2pk = bitcoin.payments.p2pk({ pubkey: keyPair.publicKey, network:testnet })
//console.log(p2pk.output)

let p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network:testnet })
console.log(p2pk.output.toString('hex'), p2pkh.address)

//hash160=sha256,ripemd160
//let pubkeyHash = bitcoin.crypto.hash160(p2pk.output);
//console.log(pubkeyHash.toString('hex'))

//let version='6f'
//let data = version + pubkeyHash.toString('hex')
//data = Buffer.from(data, 'hex')
//let hash256= bitcoin.crypto.hash256(data)
//let dhash256= bitcoin.crypto.hash256(hash256)
//let checksum=dhash256.toString('hex').slice(0,8)
//console.log(checksum)
//let hash = '6f'+pubkeyHash.toString('hex')+checksum
//console.log(bs58check.encode(Buffer.from(hash, 'hex')))

