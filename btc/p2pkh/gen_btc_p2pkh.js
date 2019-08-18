//bitcoin
//
// p2pkh address
// m/n[111]
//

const bitcoin = require('bitcoinjs-lib')

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
const testnet = btc_testnet

//key='cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ'
key='cScuLx5taDyuAfCnin5WWZz65yGCHMuuaFv6mgearmqAHC4p53sz'
key='cQeGKosJjWPn9GkB7QmvmotmBbVg1hm8UjdN6yLXEWZ5HAcRwam7'
key='cVbMJKcfEGi4wgsN39rMPkYVAaLeRaPPbrPpJfcH9B9dZCPbS7kT'
key='cNDJeJQZgLDzWS5yz6Pf1a9LzC26nDn6SZpJHcRc4212aGJ6NSXJ'
key='cRBMwm5iA2yV99cUBxSz39vKp5CmE7eZ9rjXPAPz8S2kbgf5nf3i'
key='cSBjA9u8YhQfDX4Yj2DyrgzQ1xhu5w4h9HxkHttMv4D6aWL1zyMm'

let keyPair = bitcoin.ECPair.fromWIF(key, testnet)
let p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network:testnet })
console.log(p2pkh.address, p2pkh.pubkey.toString('hex'), p2pkh.hash.toString('hex'))

