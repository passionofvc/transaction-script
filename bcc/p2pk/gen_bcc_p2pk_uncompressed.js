//bitcoin-cash
// we can not send to public key uncompressed version
//
// p2pk
// obsolete pay-to-pubkey
// uncompressed public key  41 64xxxx ac
//

let BITBOXSDK = require('bitbox-sdk').BITBOX;
let BITBOX = new BITBOXSDK({"restURL":"https://trest.bitcoin.com/v2/"});

const keyPair = BITBOX.ECPair.fromWIF('cUPiPrscXypnpHbo6bgJBYtJdrWZDVKAJUbfbwLpxnLiUd2xawLS')

let pubKey=BITBOX.ECPair.toPublicKey(keyPair)
pubKey=BITBOX.Script.pubKey.output.encode(pubKey)   // [21 <33bytes> ac]  //compressed

pubKeyHash=BITBOX.Crypto.hash160(pubKey)
const scriptPubKey= BITBOX.Script.pubKeyHash.output.encode(pubKeyHash) //  [76 a9 14:<20bytes> 88 ac]

// bx ec-to-public -u
//cRGV4F5tRJt3vjp7jN9Xi44vSmoMpaBV5ec4N1h8bFYnmJEPy1WR
pubKey=Buffer.from('0448c8bb1b0bb5fd310f333f606f9abec9471f88f19b28420c41e8ce7ab32cb62923463fc829c9b8b072a5ac26e170602081a0fc2d2a4c07a6833d50cff42bc477','hex') //uncompressed
scriptPubkey=BITBOX.Script.pubKey.output.encode(pubKey)
console.log(scriptPubkey.toString('hex'))
console.log(pubKey.toString('hex'))

