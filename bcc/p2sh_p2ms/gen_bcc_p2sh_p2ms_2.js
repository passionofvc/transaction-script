/*
 * p2sh-p2ms
 * you can create multisig address with uncompressed public key, but
 * can not spend it because of can not sign it.
*/

let BITBOX = require('bitbox-sdk').BITBOX;
let bitbox = new BITBOX({ restURL: `https://trest.bitcoin.com/v2/` })

const pubkeys = [
  Buffer.from('048939a20113b9fdc94694f38b0bd08387198dfa052d3bd137653428479128e67942c91ae46ae316f615bdb0f9b64d1190932d3fe0142384066dde2b679c850351','hex'),
  Buffer.from('04df791bc80b22d6a64668a246d11697ec331247f8b5dadd2b66819d2cb503c97b15c5db9e41a85ea5d0b803bcaae731d681ca51d2f1c1d7c7bc8620e0010275ce','hex'),
  Buffer.from('04c81f8416ac09329d95e3fc50a719da7b5eaeb64c7c914a74fe8d6f8ad3868d380cb8d2cfbc327b52ff5c135d86924d7aedd77ffa6883ea3fd05dd956472f3574','hex'),
  Buffer.from('047ba5b535f97a3709e6e9e1037f18b59974f58c16bf50db52e05c2c679dc791709d5e8b69b9d5422201372dba43be77720657f7099b72545e63360303b7be9b4e','hex'),
  Buffer.from('046ff4d346779666f1ee7ffb1ca7f30d97493515f580c26c7f703d317a4cfff68e4d514f33442713a4ec0d5cb754d34b1a83571c9fded14e517ad4aeda878fd79c','hex')
]

let redeemScript = bitbox.Script.multisig.output.encode(3, pubkeys);
let redeemScriptHash=bitbox.Crypto.hash160(redeemScript)
let p2msh=bitbox.Script.scriptHash.output.encode(redeemScriptHash)  //a9 <20bytes-hash> 87
let address = bitbox.Address.fromOutputScript(p2msh, 'testnet');
let legacy_address = bitbox.Address.toLegacyAddress(address)
console.log(address, legacy_address)



