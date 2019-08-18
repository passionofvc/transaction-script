//bitcoin
//https://blockstream.info/testnet/tx/13fb9927ec1e61ac5a801466dd17dfaf96b2fdbf078069eda9350b775ad350b7
//spent p2sh-p2wsh 2 of 2
//


const https = require('https');
const explorers = require('bitcore-explorers')
//const explorers = require('litecore-explorers')
const bitcoin = require('bitcoinjs-lib')
var bitcore = require('bitcore-lib');
const insight = new explorers.Insight('https://test-insight.bitpay.com', bitcore.Networks.testnet)
//const coinSelect = require('coinselect')
const util = require('util')

const FEE = 10000
const testnet = {
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

function processUtxos(jsonUtxos, fromAddress, keys, to){
    let txb = new bitcoin.TransactionBuilder(testnet)
    let inputsValue = 0
    let destAddress = to

    const keyPairs = [
        bitcoin.ECPair.fromWIF(keys[0], testnet),
        bitcoin.ECPair.fromWIF(keys[1], testnet),
    ]
    const pubkeys = keyPairs.map(x => x.publicKey)
    const p2ms = bitcoin.payments.p2ms({ m: 2, pubkeys, network: testnet })
    const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network: testnet })
    const p2sh = bitcoin.payments.p2sh({ redeem: p2wsh, network: testnet })

    //console.log(p2wpkh.hash)
    console.log(jsonUtxos.length)
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
     for(let j= 0; j < jsonUtxos.length; j++) {
         txb.sign({
             prevOutScriptType: 'p2sh-p2wsh-p2ms',   //p2wsh-p2pk also ok
             vin: j,
             keyPair: keyPairs[0],
             redeemScript: p2sh.redeem.output,
             witnessValue : jsonUtxos[j].value * 100000000,
             witnessScript: p2wsh.redeem.output,        //provide a witnessScript!
         });
         txb.sign({
             prevOutScriptType: 'p2sh-p2wsh-p2ms',
             vin: j,
             keyPair: keyPairs[1],
             redeemScript: p2sh.redeem.output,
             witnessValue : jsonUtxos[j].value * 100000000,
             witnessScript: p2wsh.redeem.output,        //provide a witnessScript!
         });
     }

    const tx = txb.build()
    console.log( tx.toHex() )
    //return;

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

from='2N9ekPWzSD6dTdDse83kciNfhiCZFSEVaRB'
keys=[
 'cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ',
 'cPFij267aAFsv1VaPtDEBUBBpeFf81GVaaW9ZG7nqpodNKpf4JqQ'
]

to='tb1qx6ck3lv6xlzua5zk9vmhmwc8ftccrtc0kspvpp'
let result = sweep(from, keys, to)

