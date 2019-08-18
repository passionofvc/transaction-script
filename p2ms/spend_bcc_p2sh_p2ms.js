/*
 * p2sh-p2ms
 * Transaction ID: 226e8489b7be4f613484bdff5674b6ac1ae25a266243f7621aa53f32109426c3
 * Check the status of your transaction on this block explorer:
 * https://explorer.bitcoin.com/tbch/tx/226e8489b7be4f613484bdff5674b6ac1ae25a266243f7621aa53f32109426c3
*/

const BITBOX = require('bitbox-sdk').BITBOX;
const bitbox = new BITBOX({ "restURL": "https://trest.bitcoin.com/v2/" })

async function consolidateAll(from, keyPairs, redeemScript, to) {
  try {
    // instance of transaction builder
    var transactionBuilder = new bitbox.TransactionBuilder("testnet")

    let sendAmount = 0
    const inputs = []

    const u = await bitbox.Address.utxo(from)
    console.log(u.utxos)

    let redeemScriptHash=bitbox.Crypto.hash160(redeemScript)
    //let p2msh=bitbox.Script.scriptHash.output.encode(redeemScriptHash)
    let p2msh=bitbox.Script.encodeP2SHOutput(redeemScriptHash)
    console.log(p2msh.toString('hex'))

    for (let i = 0;  i< u.utxos.length; i++) {
      const thisUtxo = u.utxos[i]
      inputs.push(thisUtxo)
      sendAmount += thisUtxo.satoshis
      transactionBuilder.addInput(thisUtxo.txid, thisUtxo.vout, transactionBuilder.DEFAULT_SEQUENCE, p2msh)
    }

    const byteCount = bitbox.BitcoinCash.getByteCount(
      { P2PKH : 1 },
      { P2PKH: 1 }
    )
    console.log(`byteCount: ${byteCount}`)

    const satoshisPerByte = 1
    let txFee = Math.ceil(satoshisPerByte * byteCount)
    console.log(`txFee: ${txFee}`)

    txFee=5000

    if (sendAmount - txFee < 0) {
      console.log(
        `Transaction fee costs more combined UTXOs. Can't send transaction.`
      )
      return
    }
    transactionBuilder.addOutput(to, sendAmount - txFee)
    console.log(redeemScript.toString('hex'))
    //let redeemScript
    inputs.forEach((input, index) => {
        console.log(index, input.satoshis)
      transactionBuilder.sign(
        index,
        keyPairs[0],
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        input.satoshis
      )
      transactionBuilder.sign(
        index,
        keyPairs[1],
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        input.satoshis
      )
      transactionBuilder.sign(
        index,
        keyPairs[2],
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        input.satoshis
      )
    })

    const tx = transactionBuilder.build()
    const hex = tx.toHex()
    console.log(`TX hex: ${hex}`)
    console.log(` `)
    //return

    const txid = await bitbox.RawTransactions.sendRawTransaction([hex])
    console.log(`Transaction ID: ${txid}`)
    console.log(`Check the status of your transaction on this block explorer:`)
    console.log(`https://explorer.bitcoin.com/tbch/tx/${txid}`)
  } catch (err) {
    console.log(`error: `, err)
  }
}
const keys=[
 'cNmT4zSKVGsmWi7EtEUMYyjAYRUuxgwTEDei1tNAkHgzfZnqU599',
 'cUG9e6ZbYTtrKd67H4bABeSEqJEmCgZCk3GnhSr8LrdRedAQPE6n',
 'cSDTy8DbJ6ghBfU9TrKRjr4wPEUoJ3vFuCHVHxKEKKCgGHQKgbsp',
// 'cQxydnwbyC6ZbKJEkTT2RrCJka7tKSm59wWpBaxzoK8NCeDEpNYZ',
// 'cReB5qyVjpXsPtnYoHqBct9oCbfxC7p2pkZkewpZ51j2oeGsXsoN'
]
const keyPairs = [
     bitbox.ECPair.fromWIF(keys[0]),
     bitbox.ECPair.fromWIF(keys[1]),
     bitbox.ECPair.fromWIF(keys[2]),
     //bitbox.ECPair.fromWIF(keys[3]),
     //bitbox.ECPair.fromWIF(keys[4]),
]

let pubkeys = [
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

//const p2ms = bitcoin.payments.p2ms({ m: 3, pubkeys: pubkeys, network: testnet })
//const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: testnet })
//console.log(p2sh.address)

const FROM_ADDR =legacy_address
const TO_ADDR = 'mfxeckezQcqFNWXM8gUQE5QrnoMWK3TPnc'

consolidateAll(FROM_ADDR, keyPairs, redeemScript, TO_ADDR)
