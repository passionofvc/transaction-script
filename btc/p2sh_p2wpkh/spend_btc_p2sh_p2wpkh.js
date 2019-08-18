//bitcoin
//https://blockstream.info/testnet/tx/9ed04b5fa893705989316ccc8ab06270958fec531c216e1d5b62f49ac4ee0dc6
//spent p2sh-p2pwkh
//2MvApX3yZ69s6QqDRKuiBS4hXw2iSkMaGE2 legacy


const https = require('https');
const explorers = require('bitcore-explorers')
//const explorers = require('litecore-explorers')
const bitcoin = require('bitcoinjs-lib')
var bitcore = require('bitcore-lib');
const insight = new explorers.Insight('https://test-insight.bitpay.com', bitcore.Networks.testnet)
//const coinSelect = require('coinselect')
const util = require('util')

const FEE = 10000
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


function getUtxos(address, key, to, callbackData) {
    https.get('https://chain.so/api/v2/get_tx_unspent/BTCTEST/'+address, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          //console.log(JSON.parse(data).data.txs)
          callbackData(JSON.parse(data).data.txs, address, key, to)
        });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

function processUtxos(jsonUtxos, fromAddress, key, to){
    let txb = new bitcoin.TransactionBuilder(btc_testnet)
    let inputsValue = 0
    let destAddress = to
    //inputs
    jsonUtxos.forEach( input => {
        console.log('input',input)
        inputsValue += input.value*100000000
        txb.addInput(input.txid, input.output_no)
    })

    //outputs
    let transferAmount = inputsValue - FEE
    if (transferAmount <= 0) {
        return;
    }
    //console.log(inputsValue,  transferAmount, FEE )
    let outputs = [
       { address: destAddress, value: transferAmount}
    ]
    outputs.forEach( target => {
        txb.addOutput(target.address, target.value)
    })

    //spent p2sh-p2wpkh
    //sign all inputs
    let keyPair = bitcoin.ECPair.fromWIF(key, btc_testnet)
    let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network:btc_testnet })
    console.log(p2wpkh.hash)
    let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network:btc_testnet })
    console.log('**********************************************')
    console.log(p2sh.redeem.output)
    //console.log('p2sh-p2wpkh', p2sh.address)
    console.log(jsonUtxos.length)
    for(let j= 0; j < jsonUtxos.length; j++) {
        txb.sign({
            prevOutScriptType: 'p2sh-p2wpkh',
            vin: j,
            keyPair: keyPair,
            redeemScript: p2sh.redeem.output,
            witnessValue: jsonUtxos[j].value*100000000,
        });
    }

    const tx = txb.build()
    console.log( tx.toHex() )
    return;

    insight.broadcast(tx.toHex(), function(error, returnedTxId) {
        if (error) {
            console.log(error)
        } else {
            console.log(returnedTxId);
        }
    });

}
function sweep(from, key, to){
    getUtxos(from, key, to ,processUtxos)
}

from='2MvApX3yZ69s6QqDRKuiBS4hXw2iSkMaGE2'
keys='cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ'
to='mjo8pQ4yYqP6NGvjLgZ3hD3Xv5n7TdWGGh'
let result = sweep(from, keys, to)

