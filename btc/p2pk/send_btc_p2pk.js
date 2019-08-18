//litecoin
//https://blockstream.info/testnet/tx/353f188f910ebf37923c56b66e0455d03b654a7c5ee443c4e680e5eeca493ae0
//send to  p2pk
//to mzi3qP7wHBTJDtSvHhRQnMYPxVbEwEWeQQ


//const explorers = require('litecore-explorers')
var explorers = require('bitcore-explorers');
const bitcoin = require('bitcoinjs-lib')
var bitcore = require('bitcore-lib');
//const coinSelect = require('coinselect')
const util = require('util')
const https = require('https');

const FEE = 10000

let insight = new explorers.Insight('https://test-insight.bitpay.com', bitcore.Networks.testnet)


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
function processUtxo(utxos, from, key, key_to) {
    let txb = new bitcoin.TransactionBuilder(testnet)
    let inputsValue = 0

    let keyPair_to = bitcoin.ECPair.fromWIF(key_to, testnet)
    let p2pk_to = bitcoin.payments.p2pk({ pubkey: keyPair_to.publicKey, network:testnet })
    let destAddress = p2pk_to.output   //send 2 public key

    let keyPair = bitcoin.ECPair.fromWIF(key, testnet)
    let p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network:testnet })
    console.log('address:', p2pkh.address)
    //inputs
    utxos.forEach( input => {
        inputsValue += (input.value * 100000000)
        txb.addInput(input.txid, input.output_no) // NOTE: provide the prevOutScript!
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

    const tx = txb.build()
    const rawtx = tx.toHex();
    //let tx = bitcoin.Transaction.fromHex(rawtx);
    console.log(rawtx)
    //return;

    insight.broadcast(tx.toHex(), function(error, returnedTxId) {
        if (error) {
            console.log(error)
        } else {
            console.log(returnedTxId);
        }
    });
}
async function sweep(from, key, to){
    //let buffer = bitcoin.address.fromBase58Check(from)
    //let fromAddress = new litecore.Address(buffer.hash, 'testnet', 'scripthash').toString()
    let fromAddress = from
    let destAddress = to

    // Get unspent transactions
    let utxos = []
    getUtxos(fromAddress, key, to, processUtxo);

}

from='mwyxmGRcMjmcYhMLaTk7KWRCpm1cEhCgby'
key='cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ'
key_to='cQFnFwrBM9unVSwUrPu65BSHwQ642pzFzQvtWKHy5ATyZMt434BD' //mzi3qP7wHBTJDtSvHhRQnMYPxVbEwEWeQQ
let result = sweep(from, key, key_to)
//console.log(result)

