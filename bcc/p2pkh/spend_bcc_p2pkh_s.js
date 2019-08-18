/*
  p2pkh->p2pkh
  Transaction ID: 79554ee8131e2183f638f5fdb2274f2535f6af5b8fe908b3c41e39ce2a787698
  Check the status of your transaction on this block explorer:
  https://explorer.bitcoin.com/tbch/tx/79554ee8131e2183f638f5fdb2274f2535f6af5b8fe908b3c41e39ce2a787698
*/

let BITBOX = require('bitbox-sdk').BITBOX;
// Instantiate SLP based on the network.
let bitbox = new BITBOX({ restURL: `https://trest.bitcoin.com/v2/` })
const fs = require('fs');

async function consolidateAll(from, keyPair, to) {
  try {
    // instance of transaction builder
    var transactionBuilder = new bitbox.TransactionBuilder("testnet")

    let sendAmount = 0
    const inputs = []

    const u = await bitbox.Address.utxo(from)
    console.log(u.utxos)

    // Loop through each UTXO assigned to this address.
    //for (let i = 0; i < u.utxos.length; i++) {
    for (let i = 0;  i< u.utxos.length && i < 500; i++) {
      const thisUtxo = u.utxos[i]
      inputs.push(thisUtxo)
      sendAmount += thisUtxo.satoshis
      // Add the utxo as an input to the transaction.
      transactionBuilder.addInput(thisUtxo.txid, thisUtxo.vout)
    }

    // get byte count to calculate fee. paying 1.2 sat/byte
    const byteCount = bitbox.BitcoinCash.getByteCount(
      { P2PKH: inputs.length },
      { P2PKH: 1 }
    )
    console.log(`byteCount: ${byteCount}`)

    const satoshisPerByte = 1
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
    inputs.forEach((input, index) => {
      transactionBuilder.sign(
        index,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        input.satoshis
      )
    })

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

var data = fs.readFileSync('keys.txt', 'utf-8');
const TO_ADDR = 'mo54nEiarmeX7coTYCigX5EcnsCznpfscF'

const lines = data.toString().split('\n')
for (let i = 0; i < lines.length - 1; i++){
    const wif = lines[i].split(',')
    const keyPair = bitbox.ECPair.fromWIF(wif[0])
    let pubKey=bitbox.ECPair.toPublicKey(keyPair)
    const pubKeyHash=bitbox.Crypto.hash160(pubKey)
    const scriptPubKey=bitbox.Script.pubKeyHash.output.encode(pubKeyHash)   // [76 a9 14<20ytes> 88 ac]
    const address = bitbox.Address.fromOutputScript(scriptPubKey, 'testnet');
    const legacy_address=bitbox.Address.toLegacyAddress(address, 'testnet')
    console.log(address, legacy_address)
    const SEND_ADDR =address
    consolidateAll(SEND_ADDR, keyPair, TO_ADDR)
}
