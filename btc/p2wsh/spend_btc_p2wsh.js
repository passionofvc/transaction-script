//bitcoin
//https://blockstream.info/testnet/tx/d3632a2919ac5ba7fae73c7ca46d20e4ba91a8d49064773bbcee7e4aa7ee648e
//spent p2wsh 3 of 3
//tb1qgru0nptg3j2w40l6eymz3lt5rqg39jnnur7ffecwv5wgu4e8p3mqc632h4
//
//more example
//https://blockstream.info/testnet/tx/33100fff01c9f47e400f04fc00aabf3dc4c444972a23bbb6a47a60eec01da098


const https = require('https');
const explorers = require('bitcore-explorers')
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

function processUtxos(jsonUtxos, fromAddress, keys, to){
    if (jsonUtxos.length <=0 ) return;

    let txb = new bitcoin.TransactionBuilder(testnet)
    let inputsValue = 0
    let destAddress = to

    const keyPairs = [
        bitcoin.ECPair.fromWIF(keys[0], testnet),
        bitcoin.ECPair.fromWIF(keys[1], testnet),
        bitcoin.ECPair.fromWIF(keys[2], testnet)
    ]
    const pubkeys = keyPairs.map(x => x.publicKey)
    const p2ms = bitcoin.payments.p2ms({ m: 3, pubkeys, network: testnet })
    const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network: testnet })

    //console.log(p2wpkh.hash)
    console.log(jsonUtxos.length)
    //inputs
    jsonUtxos.forEach( input => {
        console.log('input',input)
        inputsValue += input.value
        txb.addInput(input.txid, input.vout, null, p2wsh.output)
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
             prevOutScriptType: 'p2wsh-p2ms',   //p2wsh-p2pk also ok
             vin: j,
             keyPair: keyPairs[0],
             //redeemScript: null,  //no redemm script
             witnessValue : jsonUtxos[j].value,
             witnessScript: p2wsh.redeem.output,        //provide a witnessScript!
         });
         txb.sign({
             prevOutScriptType: 'p2wsh-p2ms',
             vin: j,
             keyPair: keyPairs[1],
             //redeemScript: null,  //no redemm script
             witnessValue : jsonUtxos[j].value,
             witnessScript: p2wsh.redeem.output,        //provide a witnessScript!
         });
         txb.sign({
             prevOutScriptType: 'p2wsh-p2ms',
             vin: j,
             keyPair: keyPairs[2],
             //redeemScript: null,  //no redemm script
             witnessValue : jsonUtxos[j].value,
             witnessScript: p2wsh.redeem.output,        //provide a witnessScript!
         });
     }

    const tx = txb.build()
    console.log( tx.toHex() )
    //return;

    //insight report [16: bad-txns-vin-empty. Code:-26], use push_raw_tx.sh to broadcast tx
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

from='tb1qgru0nptg3j2w40l6eymz3lt5rqg39jnnur7ffecwv5wgu4e8p3mqc632h4'
keys=[
    'cPFij267aAFsv1VaPtDEBUBBpeFf81GVaaW9ZG7nqpodNKpf4JqQ',
    'cSPNvQAUQQGBDXnKxLmNUg1f7JdoSoxDBteJUBcqQmsTzexvCatK',
    'cRVrMpdTo4CWvc5L7Cu1Z861KGWiF9vFyK8SNfSugMaTP5mPiJg3'
]

to='tb1qskatzryleuxaurjuutzxha8wsk0ll05xeus3hk'
let result = sweep(from, keys, to)

