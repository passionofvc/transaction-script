//bitcoin-cash
//
// p2pk compressed public key
// obsolete pay-to-pubkey
// compressed public key
//


let BITBOXSDK = require('bitbox-sdk').BITBOX;
let BITBOX = new BITBOXSDK({"restURL":"https://trest.bitcoin.com/v2/"});

const keyPair = BITBOX.ECPair.fromWIF('cUPiPrscXypnpHbo6bgJBYtJdrWZDVKAJUbfbwLpxnLiUd2xawLS')
pubKey=BITBOX.ECPair.toPublicKey(keyPair)
pubKey=BITBOX.Script.pubKey.output.encode(pubKey)   // [21 <33bytes> ac]

pubKeyHash=BITBOX.Crypto.hash160(pubKey)
const scriptPubKey= BITBOX.Script.pubKeyHash.output.encode(pubKeyHash) //  [76 a9 14:<20bytes> 88 ac]

console.log(pubKey.toString('hex'), scriptPubKey.toString('hex'))



