//https://github.com/bitcoinjs/bitcoinjs-lib/issues/1154

//litecoin
//https://chain.so/tx/LTCTEST/ff6eed3caaf3aec84c49681bdfabdd45e9421508caf8494af7cc73577d54fe13
//spent p2wsh
//tltc1qwkh2vkws75jtl7em85nwtzc9u26xfw5j6jjfs3xanvz3x7c6av3q0umfx3

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
function processUtxo(utxos, from, keys, to) {
    let txb = new bitcoin.TransactionBuilder(testnet)
    let inputsValue = 0
    let destAddress = to

    const keyPairs = [
        bitcoin.ECPair.fromWIF(keys[0], testnet),
        bitcoin.ECPair.fromWIF(keys[1], testnet),
        bitcoin.ECPair.fromWIF(keys[2], testnet)
    ]
    //let keyPair = bitcoin.ECPair.fromWIF(key, testnet)
    //const p2pk = bitcoin.payments.p2pk({ pubkey: keyPair.publicKey, network: testnet})
    //const p2wsh = bitcoin.payments.p2wsh({ redeem: p2pk, network: testnet })
    const pubkeys = keyPairs.map(x => x.publicKey)
    const p2ms = bitcoin.payments.p2ms({ m: 2, pubkeys, network: testnet })
    const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network: testnet })
    //const p2sh = bitcoin.payments.p2sh({ redeem: p2wsh, network: testnet })

    console.log('address:', p2wsh.address)
    //inputs
    utxos.forEach( input => {
        console.log(input)
        inputsValue += (input.value * 100000000)
        txb.addInput(input.txid, input.output_no, null, p2wsh.output)
        //txb.addInput(input.txid, input.output_no)
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

    // m of n m=1
    //const keyPair = bitcoin.ECPair.makeRandom({ network: regtest })
    //const p2pk = bitcoin.payments.p2pk({ pubkey: keyPair.publicKey, network: regtest })
    //const p2wsh = bitcoin.payments.p2wsh({ redeem: p2pk, network: regtest })

    //spent p2wpkh
    //sign all inputs
    for(let j= 0; j < utxos.length; j++) {
        txb.sign({
            prevOutScriptType: 'p2wsh-p2ms',   //p2wsh-p2pk also ok
            vin: j,
            keyPair: keyPairs[0],
            //redeemScript: null,  //no redemm script
            witnessValue : utxos[j].value * 100000000,
            witnessScript: p2wsh.redeem.output,        //provide a witnessScript!
        });
        txb.sign({
            prevOutScriptType: 'p2wsh-p2ms',
            vin: j,
            keyPair: keyPairs[1],
            //redeemScript: null,  //no redemm script
            witnessValue : utxos[j].value * 100000000,
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
async function sweep(from, keys, to){
    let fromAddress = from
    let destAddress = to

    // Get unspent transactions
    let utxos = []
    getUtxos(fromAddress, keys, to, processUtxo);

}

from='tltc1qwkh2vkws75jtl7em85nwtzc9u26xfw5j6jjfs3xanvz3x7c6av3q0umfx3'
keys=[
    'cPFij267aAFsv1VaPtDEBUBBpeFf81GVaaW9ZG7nqpodNKpf4JqQ',
    'cSPNvQAUQQGBDXnKxLmNUg1f7JdoSoxDBteJUBcqQmsTzexvCatK',
    'cRVrMpdTo4CWvc5L7Cu1Z861KGWiF9vFyK8SNfSugMaTP5mPiJg3'
]
to='mjo8pQ4yYqP6NGvjLgZ3hD3Xv5n7TdWGGh'
let result = sweep(from, keys, to)

