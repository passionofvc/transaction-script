//litecoin
//https://chain.so/tx/LTCTEST/ff6eed3caaf3aec84c49681bdfabdd45e9421508caf8494af7cc73577d54fe13
//sepnt p2pwkh
//tltc1qkjw69x38g0f8je9q50w3cu64f4u93vvhzgqj0r

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
const testnet = btc_testnet
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
    let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network:testnet })
    console.log('address:', p2wpkh.address)
    //inputs
    utxos.forEach( input => {
        inputsValue += (input.value * 100000000)
        txb.addInput(input.txid, input.output_no, null, p2wpkh.output) // NOTE: provide the prevOutScript!
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

    //spent p2wpkh
    //sign all inputs
    //let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network:testnet })
    //console.log('p2sh-p2wpkh', p2sh.address)
    //console.log(utxos)
    for(let j= 0; j < utxos.length; j++) {
        txb.sign({
            prevOutScriptType: 'p2wpkh',
            vin: j,
            keyPair: keyPair,
            //redeemScript: null,  //no redemm script
            witnessValue : utxos[j].value * 100000000,
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
async function sweep(from, key, to){
    let fromAddress = from
    let destAddress = to

    // Get unspent transactions
    let utxos = []
    getUtxos(fromAddress, key, to, processUtxo);

}

from='tltc1qkjw69x38g0f8je9q50w3cu64f4u93vvhzgqj0r'
key='cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ'
to='mjo8pQ4yYqP6NGvjLgZ3hD3Xv5n7TdWGGh'
let result = sweep(from, key, to)

