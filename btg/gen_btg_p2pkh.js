const bitcoin = require('bitcoinjs-lib')

bitcoingold = {
    messagePrefix: '\x18Bitcoin Gold Signed Message:\n',
    bech32: 'btg',
    bip32: {
      public:  0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 0x26,
    scriptHash: 0x17,
    wif: 0x80,
    //wif: 0xef,
    //coin: coins.BTG,
    forkId: 0x4F /* 79 */
}
const net_parameter = bitcoingold

key='KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn'

let keyPair = bitcoin.ECPair.fromWIF(key, net_parameter)
let p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network:net_parameter })
console.log(p2pkh.address, p2pkh.pubkey.toString('hex'), p2pkh.hash.toString('hex'))

