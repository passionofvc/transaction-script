//bitcoin
//spent many p2pkh


const bitcoin = require('bitcoinjs-lib')
const explorers = require('bitcore-explorers')
var bitcore = require('bitcore-lib');
const util = require('util')
const https = require('https');
const fs = require('fs')

const FEE = 10000

let insight = new explorers.Insight('https://test-insight.bitpay.com', bitcore.Networks.testnet)

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

/**
 * @param num The number to round
 * @param precision The number of decimal places to preserve
 */
function roundUp(num, precision) {
  precision = Math.pow(10, precision)
  return Math.ceil(num * precision) / precision
}

function getUtxos(address, key, to, callbackData) {
    https.get('https://blockstream.info/testnet/api/address/'+address+'/utxo', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          //console.log(JSON.parse(data).data.txs)
          callbackData(JSON.parse(data), address, key, to)
        });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}
function processUtxo(utxos, from, key, to) {
    if (utxos.length <=0 ) return;

    var utxos_100 = [];
    for(var i=0; i<utxos.length && i<=300; i++) {
       utxos_100.push(utxos[i]);
    }
    utxos=utxos_100;

    let txb = new bitcoin.TransactionBuilder(testnet)
    let inputsValue = 0
    let destAddress = to
    var utxos = utxos.filter(function(utxo) {
      return utxo.value  > 0;
    });

    let keyPair = bitcoin.ECPair.fromWIF(key, testnet)
    let p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey,  network:testnet })
    console.log('address:', p2pkh.address)
    //inputs
    utxos.forEach( input => {
        inputsValue += (input.value)
        txb.addInput(input.txid, input.vout)
    })

    //outputs
    let transferAmount = inputsValue;
    let outputs = [
       { address: destAddress, value: transferAmount}
    ]
    outputs.forEach( target => {
        txb.addOutput(target.address, target.value)
    })

    //spent p2pkh
    //sign all inputs
    console.log(utxos)
    for(let j= 0; j < utxos.length; j++) {
          txb.sign({
            prevOutScriptType: 'p2pkh',
            vin: j,
            keyPair: keyPair,
            //redeemScript: null,  //no redemm script
            //witnessValue : utxos[j].value * 100000000,
        });
    }

    let tx = txb.build()
    let rawtx = tx.toHex();
    //return;

    let size = rawtx.length / 2;
    let txb2 = new bitcoin.TransactionBuilder(testnet)
    inputsValue = 0
    utxos.forEach( input => {
         inputsValue += (input.value)
         txb2.addInput(input.txid, input.vout)
    })
    //outputs
    let bytes = roundUp(size/1024, 0)
    transferAmount = inputsValue - FEE * bytes
    console.log('inputsValue:',inputsValue, 'transferAmount:', transferAmount, 'fee:', FEE * bytes, 'bytes:', bytes)
    if (transferAmount <= 0) {
        return;
    }
    outputs = [
       { address: destAddress, value: transferAmount}
    ]
    outputs.forEach( target => {
        txb2.addOutput(target.address, target.value)
    })

    //sign all inputs
    for(let j= 0; j < utxos.length; j++) {
          txb2.sign({
              prevOutScriptType: 'p2pkh',
              vin: j,
              keyPair: keyPair,
          });
    }
    let tx2 = txb2.build()
    let rawtx2 = tx2.toHex();
    console.log(rawtx2)

    //return;
    insight.broadcast(rawtx2, function(error, returnedTxId) {
        if (error) {
            console.log(error)
        } else {
            console.log(returnedTxId);
        }
    });
}
async function sweep(from, key, to){
    let fromAddress = from
    let destAddress = to

    // Get unspent transactions
    let utxos = []
    getUtxos(fromAddress, key, to, processUtxo);

}

var data = fs.readFileSync('keys.txt', 'utf-8');
const lines = data.toString().split('\n')
for (let i = 0; i < lines.length - 1; i++){
    const wif = lines[i].split(',')
    let key=wif[0]
    let keyPair = bitcoin.ECPair.fromWIF(key, testnet)
    let p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network:testnet })
    let from=p2pkh.address
    let to='tb1qsvdnhsljnwvhjj707vka5nsn6gwymk2n5s6llu'
    let result = sweep(from, key, to)
}
