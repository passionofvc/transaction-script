//bitcoin-cash
//
// p2pkh address
// m/n[111]
//

let BITBOXSDK = require('bitbox-sdk').BITBOX;
let bitbox= new BITBOXSDK({"restURL":"https://trest.bitcoin.com/v2/"});

const keyPair = bitbox.ECPair.fromWIF('cRbHDGcp7r9tZ9fDqB4xPbLjGjLgqf6RDtbHj16xR844yYFCowyJ')
let pubKey=bitbox.ECPair.toPublicKey(keyPair)
const pubKeyHash=bitbox.Crypto.hash160(pubKey)
const scriptPubKey= bitbox.Script.pubKeyHash.output.encode(pubKeyHash) //  [76 a9 14:<20bytes> 88 ac]

//const address = bitbox.ECPair.toCashAddress(keyPair)
//const legacy_address = bitbox.ECPair.toLegacyAddress(keyPair)

const address = bitbox.Address.fromOutputScript(scriptPubKey, 'testnet');
const legacy_address = bitbox.Address.toLegacyAddress(address, 'testnet');
console.log(legacy_address, address, scriptPubKey.toString('hex'))


