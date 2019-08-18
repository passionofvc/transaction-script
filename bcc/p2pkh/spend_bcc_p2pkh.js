/*
 *
 * Transaction ID: 39f4db07cc81c227342e88b59078aa5afeacf7457e5af775065ce05b902033b9
 * Check the status of your transaction on this block explorer:
 * https://explorer.bitcoin.com/tbch/tx/39f4db07cc81c227342e88b59078aa5afeacf7457e5af775065ce05b902033b9
*/

let BITBOX = require('bitbox-sdk').BITBOX;
// Instantiate SLP based on the network.
let bitbox = new BITBOX({ restURL: `https://trest.bitcoin.com/v2/` })

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

const keyPair = bitbox.ECPair.fromWIF('cRbHDGcp7r9tZ9fDqB4xPbLjGjLgqf6RDtbHj16xR844yYFCowyJ')
let pubKey=bitbox.ECPair.toPublicKey(keyPair)
const pubKeyHash=bitbox.Crypto.hash160(pubKey)
const scriptPubKey=bitbox.Script.pubKeyHash.output.encode(pubKeyHash)   // [76 a9 14<20ytes> 88 ac]
const address = bitbox.Address.fromOutputScript(scriptPubKey, 'testnet');
const legacy_address=bitbox.Address.toLegacyAddress(address, 'testnet')
console.log(address, legacy_address)

const SEND_ADDR =address
const TO_ADDR = 'mfxeckezQcqFNWXM8gUQE5QrnoMWK3TPnc'
consolidateAll(SEND_ADDR, keyPair, TO_ADDR)
