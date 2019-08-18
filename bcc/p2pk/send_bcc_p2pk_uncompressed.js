/*
  can not pay uncompressed public key

  pay to 410448c8bb1b0bb5fd310f333f606f9abec9471f88f19b28420c41e8ce7ab32cb62923463fc829c9b8b072a5ac26e170602081a0fc2d2a4c07a6833d50cff42bc477ac
  error:  Error: 410448c8bb1b0bb5fd310f333f606f9abec9471f88f19b28420c41e8ce7ab32cb62923463fc829c9b8b072a5ac26e170602081a0fc2d2a4c07a6833d50cff42bc477ac has no matching Script

  p2pkh->p2pk
  pay to un-compresseed public key, script error
*/

let BITBOX = require('bitbox-sdk').BITBOX;
// Instantiate SLP based on the network.
let bitbox = new BITBOX({ restURL: `https://trest.bitcoin.com/v2/` })

async function consolidateAll(from, key, to) {
  try {
    // instance of transaction builder
    var transactionBuilder = new bitbox.TransactionBuilder("testnet")

    let sendAmount = 0
    const inputs = []

    const u = await bitbox.Address.utxo(SEND_ADDR)

    // Loop through each UTXO assigned to this address.
    for (let i = 0; i < u.utxos.length; i++) {
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
    console.log('send to:', to)
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
    return

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
const keyPair = bitbox.ECPair.fromWIF('cRGV4F5tRJt3vjp7jN9Xi44vSmoMpaBV5ec4N1h8bFYnmJEPy1WR')
const pubKey=bitbox.ECPair.toPublicKey(keyPair)
const pubKeyHash=bitbox.Crypto.hash160(pubKey)
const scriptPubKey=bitbox.Script.pubKeyHash.output.encode(pubKeyHash)   // [76 a9 14<20ytes> 88 ac]
const address = bitbox.Address.fromOutputScript(scriptPubKey, 'testnet');
const legacy_address=bitbox.Address.toLegacyAddress(address)

const SEND_ADDR =address
console.log(SEND_ADDR, legacy_address)

let pubKey2='410448c8bb1b0bb5fd310f333f606f9abec9471f88f19b28420c41e8ce7ab32cb62923463fc829c9b8b072a5ac26e170602081a0fc2d2a4c07a6833d50cff42bc477ac'
//pubKey2=bitbox.Script.pubKey.output.encode(pubKey)
const to=pubKey2
consolidateAll(SEND_ADDR, keyPair, to)

