//litecoin
//https://chain.so/tx/LTCTEST/13ef87f291e1222ed4765bdadd6a2e1cac56dc600c69856b78c1865f9eb1ae9b
//sepnt p2sh-p2pwkh
//2MvApX3yZ69s6QqDRKuiBS4hXw2iSkMaGE2 legacy
//QPXae4qo7FvBZ1yTx1kCWm8y5RAGgqbTqA  segwit

const explorers = require('litecore-explorers')
const bitcoin = require('bitcoinjs-lib')
//var bitcore = require('bitcore-lib');
//const coinSelect = require('coinselect')
const util = require('util')
const FEE = 100000

async function sweep(from, key, to){
    let litecore = explorers.litecore
    let insight = new explorers.Insight('https://testnet.litecore.io', litecore.Networks.testnet)
    //network_litecoin_testnet
    const　ltc_testnet　=　{
　　　　messagePrefix:　'\x19Litecoin　Signed　Message:\n',
　　　　bip32:　{　//　tpub,　tprv
　　　　　　public:　0x043587cf,
　　　　　　private: 0x04358394
　　　　},
　　　　pubKeyHash:　0x6f,
　　　　scriptHash:　0xc4,　//2 start address
　　　　wif:　0xef
    }

    let buffer = bitcoin.address.fromBase58Check(from)
    let fromAddress = new litecore.Address(buffer.hash, 'testnet', 'scripthash').toString()
    let destAddress = to

    // Get unspent transactions
    const getUtxos = util.promisify(insight.getUtxos).bind(insight)

    let jsonUtxos = []
     await getUtxos(fromAddress).then(utxos => {
          utxos.forEach(utxo => {
              let jsonUtxo = utxo.toJSON()
              jsonUtxo.value = utxo.satoshis
              jsonUtxos.push(jsonUtxo)
              console.log(jsonUtxo)
          })
    });

    let txb = new bitcoin.TransactionBuilder(ltc_testnet)
    let inputsValue = 0
    //inputs
    jsonUtxos.forEach( input => {
        console.log(input)
        inputsValue += input.value
        txb.addInput(input.txid, input.vout)
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
    let keyPair = bitcoin.ECPair.fromWIF(key, ltc_testnet)
    let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network:ltc_testnet })
    console.log(p2wpkh.hash)
    let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network:ltc_testnet })
    console.log(p2sh.redeem)
    //console.log('p2sh-p2wpkh', p2sh.address)
    for(let j= 0; j < jsonUtxos.length; j++) {
        txb.sign({
            prevOutScriptType: 'p2sh-p2wpkh',
            vin: j,
            keyPair: keyPair,
            redeemScript: p2sh.redeem.output,
            witnessValue: jsonUtxos[j].value,
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

from='2MvApX3yZ69s6QqDRKuiBS4hXw2iSkMaGE2'
keys='cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ'
to='mjo8pQ4yYqP6NGvjLgZ3hD3Xv5n7TdWGGh'
let result = sweep(from, keys, to)
console.log(result)
