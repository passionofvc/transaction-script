//https://github.com/bitcoinjs/bitcoinjs-lib/issues/1154

//litecoin
//https://chain.so/tx/LTCTEST/2091938eaab387a654aff6846dd71f4a4997d3fb2bf8c876701c90937bf5d0b8
//sepnt p2sh-p2wsh
// 2N9neRFG247auGm4X9y74CwbQWzy4B4i5EE legacy
// Qd9QYG8G5DdzQwpZn595He2qfPQt7GPmGW  segwit

const explorers = require('litecore-explorers')
const bitcoin = require('bitcoinjs-lib')
//var bitcore = require('bitcore-lib');
//const coinSelect = require('coinselect')
const util = require('util')
const FEE = 100000

async function sweep(from, keys, to){
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

    // Validate the wallets.
    if (!litecore.Address.isValid(fromAddress)) {
        return({success: false, error: `Invalid wallet (from): ${fromAddress}`})
    }
    if (!litecore.Address.isValid(destAddress)) {
        return({success: false, error: `Invalid wallet (to): ${destAddress}`})
    }

    // Get unspent transactions
    const getUtxos = util.promisify(insight.getUtxos).bind(insight)

    let jsonUtxos = []
     await getUtxos(fromAddress).then(utxos => {
          utxos.forEach(utxo => {
              let jsonUtxo = utxo.toJSON()
              jsonUtxo.value = utxo.satoshis
              jsonUtxos.push(jsonUtxo)
              //console.log(jsonUtxo)
          })
    });

    let txb = new bitcoin.TransactionBuilder(ltc_testnet)
    let inputsValue = 0
    //inputs
    jsonUtxos.forEach( input => {
        //console.log(input)
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
    const keyPairs = [
        bitcoin.ECPair.fromWIF(keys[0], ltc_testnet),
        bitcoin.ECPair.fromWIF(keys[1], ltc_testnet),
        bitcoin.ECPair.fromWIF(keys[2], ltc_testnet)
    ]

    const pubkeys = keyPairs.map(x => x.publicKey)
    const p2ms = bitcoin.payments.p2ms({ m: 2, pubkeys, network: ltc_testnet})  // 2 of 3
    const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network:ltc_testnet })
    const p2sh = bitcoin.payments.p2sh({ redeem: p2wsh, network: ltc_testnet })

    console.log('p2sh-p2wsh', p2sh.address)
    console.log('p2sh', p2sh.redeem.output.toString('hex'))
    console.log('p2wsh', p2wsh.redeem.output.toString('hex'))
    for(let j= 0; j < jsonUtxos.length; j++) {
        txb.sign({
            prevOutScriptType: 'p2sh-p2wsh-p2ms',
            vin: j,
            keyPair: keyPairs[0],
            redeemScript: p2sh.redeem.output,
            witnessValue: jsonUtxos[j].value,
            witnessScript: p2wsh.redeem.output,
        });
        txb.sign({
            prevOutScriptType: 'p2sh-p2wsh-p2ms',
            vin: j,
            keyPair: keyPairs[1],
            redeemScript: p2sh.redeem.output,
            witnessValue: jsonUtxos[j].value,
            witnessScript: p2wsh.redeem.output,
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

from='2N9neRFG247auGm4X9y74CwbQWzy4B4i5EE'
keys=[
  'cPFij267aAFsv1VaPtDEBUBBpeFf81GVaaW9ZG7nqpodNKpf4JqQ',
  'cSPNvQAUQQGBDXnKxLmNUg1f7JdoSoxDBteJUBcqQmsTzexvCatK',
  'cRVrMpdTo4CWvc5L7Cu1Z861KGWiF9vFyK8SNfSugMaTP5mPiJg3'
]
to='mjo8pQ4yYqP6NGvjLgZ3hD3Xv5n7TdWGGh'
let result = sweep(from, keys, to)
console.log(result)

