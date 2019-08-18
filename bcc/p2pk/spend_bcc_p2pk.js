
/*
  Consolidate all UTXOs in an address into a single UTXO
  Transaction ID: cdab86f7fb12248b7447853b52b8c17c2df85282976f154e5455a758357030ec
   https://explorer.bitcoin.com/tbch/tx/cdab86f7fb12248b7447853b52b8c17c2df85282976f154e5455a758357030ec

  p2pk->p2pkh
  redeem compressed public key input to p2pkh
*/

let BITBOX = require('bitbox-sdk').BITBOX;
// Instantiate SLP based on the network.
let bitbox = new BITBOX({ restURL: `https://trest.bitcoin.com/v2/` })

async function consolidateAll(from, keyPair1, to) {
  try {
    // instance of transaction builder
    var transactionBuilder = new bitbox.TransactionBuilder("testnet")

    let sendAmount = 0
    const inputs = []

    const u = await bitbox.Address.utxo(SEND_ADDR)

     let  pubKey= bitbox.ECPair.toPublicKey(keyPair1)
     pubKey= bitbox.Script.pubKey.output.encode(pubKey) //  [21  <33bytes> ac]

    console.log(u.utxos)
    // Loop through each UTXO assigned to this address.
    var utxo = {
      txid : '2d63cad86db26d12f3d1043141787f23a18db7942fc84ad15a765b11c0a0dfde',
      vout : 0,
      satoshi: 0.09998080 * 100000000
    }
    sendAmount += (0.09998080 * 100000000)
    // Add the utxo as an input to the transaction.
    transactionBuilder.addInput(utxo.txid, utxo.vout, transactionBuilder.DEFAULT_SEQUENCE, pubKey)

    // get byte count to calculate fee. paying 1.2 sat/byte
    const byteCount = bitbox.BitcoinCash.getByteCount(
      { P2PKH: inputs.length },
      { P2PKH: 1 }
    )
    console.log(`byteCount: ${byteCount}`)

    const satoshisPerByte = 10
    const txFee = Math.ceil(satoshisPerByte * byteCount)
    console.log(`txFee: ${txFee}`)

    // Exit if the transaction costs too much to send.
    if (sendAmount - txFee < 0) {
      console.log(
        `Transaction fee costs more combined UTXOs. Can't send transaction.`
      )
      return
    }

    // add output w/ address and amount to send
    transactionBuilder.addOutput(to, sendAmount - txFee)
    let redeemScript
     transactionBuilder.sign(
       0,
       keyPair1,
       redeemScript,
       transactionBuilder.hashTypes.SIGHASH_ALL,
       0.09998080 * 100000000
     )

    // build tx
    const tx = transactionBuilder.build()
    // output rawhex
    const hex = tx.toHex()
    console.log(`TX hex: ${hex}`)
    console.log(` `)
    //return

    // Broadcast transation to the network
    const txid = await bitbox.RawTransactions.sendRawTransaction([hex])
    console.log(`Transaction ID: ${txid}`)
    console.log(`Check the status of your transaction on this block explorer:`)
    console.log(`https://explorer.bitcoin.com/tbch/tx/${txid}`)
  } catch (err) {
    console.log(`error: `, err)
  }
}

// sign
const keyPair1 = bitbox.ECPair.fromWIF('cUPiPrscXypnpHbo6bgJBYtJdrWZDVKAJUbfbwLpxnLiUd2xawLS')
let pubKey1=bitbox.ECPair.toPublicKey(keyPair1)
//pubKey1=bitbox.Script.pubKey.output.encode(pubKey1)
const pubKeyHash1=bitbox.Crypto.hash160(pubKey1)
const scriptPubKey1=bitbox.Script.pubKeyHash.output.encode(pubKeyHash1)   // [76 a9 14<20ytes> 88 ac]
const address1 = bitbox.Address.fromOutputScript(scriptPubKey1, 'testnet');
const legacy_address1=bitbox.Address.toLegacyAddress(address1)

const SEND_ADDR =address1
console.log(SEND_ADDR, legacy_address1)

const keyPair2 = bitbox.ECPair.fromWIF('cUPiPrscXypnpHbo6bgJBYtJdrWZDVKAJUbfbwLpxnLiUd2xawLS')
const pubKey2=bitbox.ECPair.toPublicKey(keyPair2)
const pubKeyHash2=bitbox.Crypto.hash160(pubKey2)
const scriptPubKey2=bitbox.Script.pubKeyHash.output.encode(pubKeyHash2)   // [76 a9 14<20ytes> 88 ac]
const address2 = bitbox.Address.fromOutputScript(scriptPubKey2, 'testnet');
const legacy_address2=bitbox.Address.toLegacyAddress(address2)

consolidateAll(SEND_ADDR, keyPair1, address2)

