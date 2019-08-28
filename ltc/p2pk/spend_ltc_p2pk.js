//litecoin
//https://testnet.litecore.io/tx/3c9547148916c3bc7add69d4cd9846d1ef2730bec7eb0a2476b11eef9356a15d
//redeem from  p2pk
//mzi3qP7wHBTJDtSvHhRQnMYPxVbEwEWeQQ


const explorers = require('litecore-explorers')
const bitcoin = require('bitcoinjs-lib')
//var bitcore = require('bitcore-lib');
//const coinSelect = require('coinselect')
const util = require('util')
const https = require('https');

const FEE = 100000

let litecore = explorers.litecore
let insight = new explorers.Insight('https://testnet.litecore.io', litecore.Networks.testnet)


//network_litecoin_testnet
const　ltc_testnet　=　{
　　messagePrefix:　'\x19Litecoin　Signed　Message:\n',
    bech32: 'tltc',
　　bip32:　{　//　tpub,　tprv
　　　　public:　0x043587cf,
　　　　private: 0x04358394
　　},
　　pubKeyHash:　0x6f,
　　scriptHash:　0xc4,　//2 start address
　　wif:　0xef
}

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
const testnet = ltc_testnet
function getUtxos(address, key, to, callbackData) {
    https.get('https://chain.so/api/v2/get_tx_unspent/LTCTEST/'+address, (resp) => {
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
function processUtxo(utxos, from, key, to) {
    let txb = new bitcoin.TransactionBuilder(testnet)
    let inputsValue = 0
    let destAddress = to

    let keyPair = bitcoin.ECPair.fromWIF(key, testnet)
    let p2pk = bitcoin.payments.p2pk({ pubkey: keyPair.publicKey, network:testnet })
    console.log('address:', p2pk.output.toString('hex'))  //redeem from p2-public-key
    //inputs
    utxos.forEach( input => {
        inputsValue += (input.value * 100000000)
        txb.addInput(input.txid, input.output_no, null, p2pk.output) // NOTE: provide the p2pk
    })

    //outputs
    let transferAmount = inputsValue - FEE
    console.log('inputsValue:',inputsValue, 'transferAmount:', transferAmount, 'fee:', FEE)
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

    //spent p2pk
    //sign all inputs
    console.log(utxos)
    for(let j= 0; j < utxos.length; j++) {
        txb.sign({
            prevOutScriptType: 'p2pk',
            vin: j,
            keyPair: keyPair,
            //redeemScript: null,  //no redemm script
            //witnessValue : utxos[j].value * 100000000,
        });
    }

    const tx = txb.build()
    const rawtx = tx.toHex();
    //let tx = bitcoin.Transaction.fromHex(rawtx);
    console.log(rawtx)
    return;

    insight.broadcast(tx.toHex(), function(error, returnedTxId) {
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

from='mzi3qP7wHBTJDtSvHhRQnMYPxVbEwEWeQQ'
key='cQFnFwrBM9unVSwUrPu65BSHwQ642pzFzQvtWKHy5ATyZMt434BD'
to='tltc1qqpsefxgcxuqe26ccny8lvwcy5rnsw00w9p6na8'
let result = sweep(from, key, to)

